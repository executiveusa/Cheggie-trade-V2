import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | CheggieTrade",
  description: "Simple, transparent pricing. Choose the plan that fits your trading needs.",
  openGraph: {
    title: "Pricing | CheggieTrade",
    description: "Simple, transparent pricing. Choose the plan that fits your trading needs.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
