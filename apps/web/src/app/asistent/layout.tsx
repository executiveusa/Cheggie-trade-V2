import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asistent | CheggieTrade",
  description: "Your AI trading assistant. Get direct answers to your trading questions without jargon.",
  openGraph: {
    title: "Asistent | CheggieTrade",
    description: "Your AI trading assistant. Get direct answers to your trading questions without jargon.",
  },
};

export default function AsistentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
