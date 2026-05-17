import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "CheggieTrade — Tržišna analiza",
  description: "CheggieTrade pretvara tržišnu buku u jasan trading plan.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <Nav />
        <main style={{ paddingTop: "60px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
