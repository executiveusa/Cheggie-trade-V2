import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist | CheggieTrade",
  description: "Track your positions in real time. Monitor prices and changes for your favorite tickers.",
  openGraph: {
    title: "Watchlist | CheggieTrade",
    description: "Track your positions in real time. Monitor prices and changes for your favorite tickers.",
  },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
