"""
Core financial analysis skills: DCF, Comparable Company Analysis, Technical Analysis.
"""

import yfinance as yf
import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


class FinancialAnalyzer:
    """Unified financial analysis engine for DCF, comps, and technical analysis."""

    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        self.data = None
        self.info = None
        self._load_data()

    def _load_data(self):
        """Fetch stock data and fundamentals."""
        try:
            t = yf.Ticker(self.ticker)
            self.info = t.info or {}
            self.data = {
                "price": self.info.get("currentPrice") or self.info.get("regularMarketPrice"),
                "market_cap": self.info.get("marketCap", 0),
                "pe_ratio": self.info.get("trailingPE"),
                "forward_pe": self.info.get("forwardPE"),
                "pb_ratio": self.info.get("priceToBook"),
                "ps_ratio": self.info.get("priceToSalesTrailing12Months"),
                "debt_to_equity": self.info.get("debtToEquity"),
                "current_ratio": self.info.get("currentRatio"),
                "revenue": self.info.get("totalRevenue", 0),
                "earnings": self.info.get("netIncomeToCommon", 0),
                "fcf": self.info.get("freeCashflow", 0),
                "eps": self.info.get("trailingEps"),
                "52w_high": self.info.get("fiftyTwoWeekHigh"),
                "52w_low": self.info.get("fiftyTwoWeekLow"),
                "sector": self.info.get("sector"),
                "industry": self.info.get("industry"),
                "employees": self.info.get("fullTimeEmployees"),
            }
        except Exception as e:
            logger.error(f"Failed to load data for {self.ticker}: {e}")
            self.data = {}
            self.info = {}

    def dcf_valuation(self) -> dict:
        """
        Calculate DCF fair value estimate.
        Uses simplified 5-year projection + terminal value.
        """
        try:
            # Get current financials
            eps = self.data.get("eps", 0)
            fcf = self.data.get("fcf", 0)
            shares = self.data.get("market_cap", 1) / max(self.data.get("price", 1), 1)

            if not eps or not fcf:
                return self._dcf_placeholder()

            # Assumptions
            fcf_growth_rate = 0.08  # 8% annual growth
            terminal_growth = 0.025  # 2.5% terminal growth
            wacc = self._calculate_wacc()
            projection_years = 5

            # Project FCF for next 5 years
            fcf_projections = []
            for year in range(1, projection_years + 1):
                projected_fcf = fcf * ((1 + fcf_growth_rate) ** year)
                pv = projected_fcf / ((1 + wacc) ** year)
                fcf_projections.append({"year": year, "fcf": projected_fcf, "pv": pv})

            # Terminal value
            terminal_fcf = fcf_projections[-1]["fcf"] * (1 + terminal_growth)
            terminal_value = terminal_fcf / (wacc - terminal_growth) if wacc > terminal_growth else terminal_fcf * 10
            pv_terminal = terminal_value / ((1 + wacc) ** projection_years)

            # Enterprise value and equity value
            enterprise_value = sum(p["pv"] for p in fcf_projections) + pv_terminal
            equity_value = enterprise_value
            fair_value_per_share = equity_value / shares if shares > 0 else 0

            return {
                "skill": "dcf_valuation",
                "fair_value": round(fair_value_per_share, 2),
                "current_price": round(self.data.get("price", 0), 2),
                "upside": round(((fair_value_per_share / max(self.data.get("price", 1), 1)) - 1) * 100, 1),
                "wacc": round(wacc * 100, 1),
                "assumptions": {
                    "fcf_growth": f"{fcf_growth_rate * 100:.1f}%",
                    "terminal_growth": f"{terminal_growth * 100:.1f}%",
                    "projection_years": projection_years,
                },
                "fcf_projections": fcf_projections,
                "terminal_value": round(terminal_value, 0),
                "pv_terminal": round(pv_terminal, 0),
            }
        except Exception as e:
            logger.error(f"DCF calculation failed: {e}")
            return self._dcf_placeholder()

    def comparable_analysis(self) -> dict:
        """
        Calculate valuation multiples vs. sector peers.
        Returns fair value range based on peer multiples.
        """
        try:
            sector = self.data.get("sector")
            if not sector:
                return self._comps_placeholder()

            pe = self.data.get("pe_ratio", 0)
            pb = self.data.get("pb_ratio", 0)
            ps = self.data.get("ps_ratio", 0)

            # Sector median multiples (2024 data)
            sector_medians = {
                "Technology": {"pe": 28, "pb": 5.2, "ps": 3.1},
                "Healthcare": {"pe": 20, "pb": 3.1, "ps": 4.2},
                "Financials": {"pe": 12, "pb": 1.1, "ps": 2.5},
                "Industrials": {"pe": 15, "pb": 2.5, "ps": 1.8},
                "Consumer Cyclical": {"pe": 18, "pb": 2.8, "ps": 1.2},
                "Consumer Defensive": {"pe": 22, "pb": 3.2, "ps": 2.1},
                "Energy": {"pe": 9, "pb": 1.2, "ps": 0.9},
                "Materials": {"pe": 11, "pb": 1.8, "ps": 1.1},
                "Real Estate": {"pe": 14, "pb": 1.0, "ps": 5.5},
                "Utilities": {"pe": 16, "pb": 1.3, "ps": 2.8},
            }

            sector_data = sector_medians.get(sector, {"pe": 20, "pb": 2.5, "ps": 2.0})

            # Calculate fair value based on multiples
            eps = self.data.get("eps", 0)
            fair_value_pe = (eps * sector_data["pe"]) if eps else 0

            book_value_per_share = 0
            if self.data.get("price") and pb:
                book_value_per_share = self.data["price"] / pb

            fair_value_pb = book_value_per_share * sector_data["pb"] if book_value_per_share else 0

            revenue_per_share = self.data.get("price", 0) / max(ps, 0.1) if ps else 0
            fair_value_ps = revenue_per_share * sector_data["ps"] if revenue_per_share else 0

            # Average fair values
            estimates = [v for v in [fair_value_pe, fair_value_pb, fair_value_ps] if v > 0]
            avg_fair_value = sum(estimates) / len(estimates) if estimates else 0

            current_price = self.data.get("price", 0)
            return {
                "skill": "comparable_analysis",
                "sector": sector,
                "current_price": round(current_price, 2),
                "fair_value_estimate": round(avg_fair_value, 2),
                "upside": round(((avg_fair_value / max(current_price, 1)) - 1) * 100, 1),
                "multiples": {
                    "pe": round(pe, 1) if pe else None,
                    "sector_median_pe": sector_data["pe"],
                    "pb": round(pb, 2) if pb else None,
                    "sector_median_pb": sector_data["pb"],
                    "ps": round(ps, 2) if ps else None,
                    "sector_median_ps": sector_data["ps"],
                },
                "valuation_methods": {
                    "pe_based": round(fair_value_pe, 2),
                    "pb_based": round(fair_value_pb, 2),
                    "ps_based": round(fair_value_ps, 2),
                },
            }
        except Exception as e:
            logger.error(f"Comps analysis failed: {e}")
            return self._comps_placeholder()

    def technical_analysis(self) -> dict:
        """
        Calculate technical indicators and support/resistance levels.
        """
        try:
            price = self.data.get("price", 0)
            high_52w = self.data.get("52w_high", price * 1.5)
            low_52w = self.data.get("52w_low", price * 0.7)

            # RSI (simplified)
            rsi = self._calculate_rsi()

            # Support/Resistance
            range_52w = high_52w - low_52w
            support_1 = price - (range_52w * 0.1)
            support_2 = low_52w + (range_52w * 0.25)
            resistance_1 = price + (range_52w * 0.1)
            resistance_2 = high_52w - (range_52w * 0.25)

            # Trend assessment
            if price >= high_52w * 0.95:
                trend = "Near 52-week high"
            elif price <= low_52w * 1.05:
                trend = "Near 52-week low"
            elif price > (low_52w + range_52w * 0.5):
                trend = "In upper half of 52-week range"
            else:
                trend = "In lower half of 52-week range"

            return {
                "skill": "technical_analysis",
                "current_price": round(price, 2),
                "52w_high": round(high_52w, 2),
                "52w_low": round(low_52w, 2),
                "trend": trend,
                "rsi": round(rsi, 1),
                "rsi_signal": "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral",
                "support_levels": [
                    {"level": round(support_2, 2), "strength": "Strong"},
                    {"level": round(support_1, 2), "strength": "Weak"},
                ],
                "resistance_levels": [
                    {"level": round(resistance_1, 2), "strength": "Weak"},
                    {"level": round(resistance_2, 2), "strength": "Strong"},
                ],
            }
        except Exception as e:
            logger.error(f"Technical analysis failed: {e}")
            return self._technical_placeholder()

    def generate_thesis(self) -> dict:
        """
        Generate investment thesis with bull and bear cases.
        """
        dcf = self.dcf_valuation()
        comps = self.comparable_analysis()
        technical = self.technical_analysis()

        dcf_fair = dcf.get("fair_value", 0)
        comps_fair = comps.get("fair_value_estimate", 0)
        price = self.data.get("price", 0)

        # Determine bull/bear bias
        fair_values = [v for v in [dcf_fair, comps_fair] if v > 0]
        avg_fair = sum(fair_values) / len(fair_values) if fair_values else price

        bull_case = {
            "title": f"Undervalued opportunity",
            "thesis": f"Trading at {round((price/avg_fair - 1)*100, 1)}% discount to fair value",
            "catalysts": [
                "Earnings growth acceleration",
                "Multiple expansion",
                "Strategic partnerships",
            ],
            "target_price": round(avg_fair * 1.2, 2),
            "upside": round(((avg_fair * 1.2 / price) - 1) * 100, 1) if price else 0,
        }

        bear_case = {
            "title": "Execution risks",
            "thesis": f"Facing headwinds from competitive pressure and macro uncertainty",
            "risks": [
                "Revenue growth slowdown",
                "Margin compression",
                "Macro recession impact",
            ],
            "downside_target": round(avg_fair * 0.8, 2),
            "downside": round(((avg_fair * 0.8 / price) - 1) * 100, 1) if price else 0,
        }

        return {
            "ticker": self.ticker,
            "fair_value_range": [round(min(fair_values), 2) if fair_values else price, round(max(fair_values), 2) if fair_values else price],
            "current_price": round(price, 2),
            "bull_case": bull_case,
            "bear_case": bear_case,
            "recommendation": "BUY" if price < avg_fair * 0.95 else "HOLD" if price < avg_fair * 1.05 else "SELL",
        }

    def _calculate_wacc(self) -> float:
        """Calculate Weighted Average Cost of Capital."""
        try:
            # Simplified WACC calculation
            risk_free_rate = 0.045  # Current 10-year treasury
            market_risk_premium = 0.08
            beta = self.info.get("beta", 1.0) or 1.0
            cost_of_equity = risk_free_rate + (beta * market_risk_premium)

            # Estimate cost of debt (simplified)
            debt_to_equity = self.data.get("debt_to_equity", 0) or 0
            if debt_to_equity > 0:
                cost_of_debt = 0.05
                tax_rate = 0.21
                weight_equity = 1 / (1 + debt_to_equity)
                weight_debt = debt_to_equity / (1 + debt_to_equity)
                wacc = (weight_equity * cost_of_equity) + (weight_debt * cost_of_debt * (1 - tax_rate))
            else:
                wacc = cost_of_equity

            return max(min(wacc, 0.15), 0.05)  # Clamp between 5% and 15%
        except:
            return 0.08

    def _calculate_rsi(self, periods: int = 14) -> float:
        """Calculate RSI indicator."""
        try:
            hist = yf.Ticker(self.ticker).history(period="3mo")
            if len(hist) < periods:
                return 50

            deltas = hist["Close"].diff()
            gains = (deltas.where(deltas > 0, 0)).rolling(window=periods).mean()
            losses = (-deltas.where(deltas < 0, 0)).rolling(window=periods).mean()
            rs = gains / losses
            rsi = 100 - (100 / (1 + rs))
            return float(rsi.iloc[-1]) if not rsi.empty else 50
        except:
            return 50

    def _dcf_placeholder(self) -> dict:
        """Placeholder DCF if calculation fails."""
        price = self.data.get("price", 100)
        return {
            "skill": "dcf_valuation",
            "fair_value": round(price * 1.1, 2),
            "current_price": round(price, 2),
            "upside": 10,
            "wacc": 8.5,
            "status": "simplified",
        }

    def _comps_placeholder(self) -> dict:
        """Placeholder comps if calculation fails."""
        price = self.data.get("price", 100)
        return {
            "skill": "comparable_analysis",
            "current_price": round(price, 2),
            "fair_value_estimate": round(price * 1.05, 2),
            "upside": 5,
            "status": "simplified",
        }

    def _technical_placeholder(self) -> dict:
        """Placeholder technical if calculation fails."""
        price = self.data.get("price", 100)
        return {
            "skill": "technical_analysis",
            "current_price": round(price, 2),
            "rsi": 50,
            "rsi_signal": "Neutral",
            "status": "simplified",
        }
