import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "CheggieTrade — AI trading desk",
  description: "CheggieTrade pretvara tržišnu buku u jasan trading plan.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body>
        <AppProvider>
          <Nav />
          <main style={{ paddingTop: "64px" }}>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
