import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Izvestaji | CheggieTrade",
  description: "Analysis archive. Browse previous reports and archived position analyses.",
  openGraph: {
    title: "Izvestaji | CheggieTrade",
    description: "Analysis archive. Browse previous reports and archived position analyses.",
  },
};

export default function IzvestajiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
