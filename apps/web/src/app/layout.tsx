import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Nav from "@/components/Nav";
import ServiceBannerWrapper from "@/components/ServiceBannerWrapper";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CheggieTrade — AI trading desk",
  description: "CheggieTrade pretvara tržišnu buku u jasan trading plan.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="sr"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ background: "var(--bg)" }}
    >
      <body>
        <AppProvider>
          <Nav />
          <ServiceBannerWrapper />
          <main style={{ paddingTop: "64px" }}>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
