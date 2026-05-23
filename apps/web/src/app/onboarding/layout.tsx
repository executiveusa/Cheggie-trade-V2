import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | CheggieTrade",
  description: "Learn how CheggieTrade works. From market noise to a clear trading plan in 5 simple steps.",
  openGraph: {
    title: "Get Started | CheggieTrade",
    description: "Learn how CheggieTrade works. From market noise to a clear trading plan in 5 simple steps.",
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
