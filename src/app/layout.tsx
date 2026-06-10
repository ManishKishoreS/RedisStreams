import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetireWise Global — Cross-Border Retirement Planning",
  description:
    "Tax-aware, cross-border retirement planning with Monte Carlo simulation, scenario stress testing, and year-by-year projections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
