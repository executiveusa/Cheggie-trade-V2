import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analiza | CheggieTrade",
  description: "AI-powered market analysis. Enter a ticker symbol and get a clear trading signal from multiple AI analysts.",
  openGraph: {
    title: "Analiza | CheggieTrade",
    description: "AI-powered market analysis. Enter a ticker symbol and get a clear trading signal from multiple AI analysts.",
  },
};

export default function AnalizaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
