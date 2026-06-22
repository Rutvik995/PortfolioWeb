import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rutvik Bhanderi — Data Science & AI Engineer",
  description:
    "Portfolio of Rutvik Bhanderi — MSc Data Science student building intelligent systems, NL-to-SQL pipelines, autonomous AI agents, and ML-powered financial platforms.",
  keywords: [
    "Rutvik Bhanderi",
    "Data Science",
    "AI Engineer",
    "Machine Learning",
    "Portfolio",
    "LangGraph",
    "NL-to-SQL",
  ],
  authors: [{ name: "Rutvik Bhanderi" }],
  openGraph: {
    title: "Rutvik Bhanderi — Data Science & AI Engineer",
    description: "Building intelligent systems that push the boundaries of AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
