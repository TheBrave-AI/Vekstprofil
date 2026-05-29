import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// Fraunces is loaded via next/font for automatic optimization and self-hosting.
// Satoshi (Fontshare) is loaded via @import in globals.css — next/font only supports Google Fonts.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brave — Kartlegging",
  description: "Kartlegg din nåværende salgs- og markedssituasjon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${fraunces.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
        />
      </head>
      <body className="min-h-full">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
