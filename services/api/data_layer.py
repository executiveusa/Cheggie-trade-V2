"""
Data layer — normalizes yfinance and NewsAPI data before passing to agents.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional

import yfinance as yf
import requests

logger = logging.getLogger(__name__)

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"


def get_stock_snapshot(ticker: str) -> dict:
    """Fetch and normalize current stock data via yfinance."""
    try:
        t = yf.Ticker(ticker)
        info = t.info or {}
        hist = t.history(period="5d")

        price = info.get("currentPrice") or info.get("regularMarketPrice")
        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        change_pct = None
        if price and prev_close and prev_close != 0:
            change_pct = round((price - prev_close) / prev_close * 100, 2)

        return {
            "ticker": ticker.upper(),
            "name": info.get("longName") or info.get("shortName", ticker),
            "price": price,
            "change_pct": change_pct,
            "volume": info.get("volume") or info.get("regularMarketVolume"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "52w_high": info.get("fiftyTwoWeekHigh"),
            "52w_low": info.get("fiftyTwoWeekLow"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "history": hist["Close"].tail(5).to_dict() if not hist.empty else {},
            "fetched_at": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        logger.warning("yfinance fetch failed for %s: %s", ticker, e)
        return _empty_snapshot(ticker, str(e))


def get_news(ticker: str, days: int = 7, limit: int = 10) -> list[dict]:
    """Fetch normalized news from NewsAPI. Falls back to yfinance news."""
    if NEWS_API_KEY:
        try:
            from_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
            r = requests.get(
                NEWS_API_URL,
                params={
                    "q": ticker,
                    "from": from_date,
                    "sortBy": "relevancy",
                    "pageSize": limit,
                    "apiKey": NEWS_API_KEY,
                },
                timeout=10,
            )
            r.raise_for_status()
            articles = r.json().get("articles", [])
            return [_normalize_newsapi_article(a) for a in articles[:limit]]
        except Exception as e:
            logger.warning("NewsAPI failed: %s — falling back to yfinance news", e)

    return _yfinance_news(ticker, limit)


def _yfinance_news(ticker: str, limit: int) -> list[dict]:
    try:
        t = yf.Ticker(ticker)
        news = t.news or []
        return [
            {
                "title": n.get("title", ""),
                "source": n.get("publisher", ""),
                "url": n.get("link", ""),
                "published_at": datetime.utcfromtimestamp(n.get("providerPublishTime", 0)).isoformat() + "Z",
                "summary": n.get("summary", ""),
            }
            for n in news[:limit]
        ]
    except Exception as e:
        logger.warning("yfinance news fallback failed: %s", e)
        return []


def _normalize_newsapi_article(article: dict) -> dict:
    return {
        "title": article.get("title", ""),
        "source": article.get("source", {}).get("name", ""),
        "url": article.get("url", ""),
        "published_at": article.get("publishedAt", ""),
        "summary": article.get("description", "") or article.get("content", ""),
    }


def _empty_snapshot(ticker: str, error: str) -> dict:
    return {
        "ticker": ticker.upper(),
        "name": ticker,
        "price": None,
        "change_pct": None,
        "volume": None,
        "market_cap": None,
        "pe_ratio": None,
        "52w_high": None,
        "52w_low": None,
        "sector": None,
        "industry": None,
        "history": {},
        "error": error,
        "fetched_at": datetime.utcnow().isoformat() + "Z",
    }
