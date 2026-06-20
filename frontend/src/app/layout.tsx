import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhaleMind AI — Institutional Crypto Intelligence & GNN predictions Platform",
  description: "Detect crypto whales, train Graph Neural Networks (GNNs), analyze alpha signals, and backtest trading strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
