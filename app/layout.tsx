import type { Metadata } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import ThemeScript from "@/components/ThemeScript";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rutvik Bhanderi — AI Systems Engineer",
  description:
    "AI Systems Engineer building production-grade agentic AI (LangGraph, multi-agent pipelines, RAG, NL-to-SQL) and the full-stack products around them. Based in Rajkot, India.",
  keywords: [
    "Rutvik Bhanderi",
    "AI Systems Engineer",
    "Agentic AI",
    "LangGraph",
    "Multi-Agent Architecture",
    "RAG",
    "NL-to-SQL",
    "FastAPI",
    "Rajkot India",
    "Data Scientist",
  ],
  authors: [{ name: "Rutvik Bhanderi" }],
  creator: "Rutvik Bhanderi",
  metadataBase: new URL("https://rutvikbhanderi.dev"), // [[FILL: replace with your verified production domain]]
  openGraph: {
    title: "Rutvik Bhanderi — AI Systems Engineer",
    description:
      "I build AI agents that actually finish the job. Production-grade LangGraph architectures, tiered memory, and full-stack software systems.",
    type: "website",
    locale: "en_US",
    url: "https://rutvikbhanderi.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rutvik Bhanderi — AI Systems Engineer",
    description:
      "Production-grade agentic AI, LangGraph multi-agent pipelines, and full-stack software products.",
  },
  alternates: {
    canonical: "https://rutvikbhanderi.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rutvik Bhanderi",
    jobTitle: "AI Systems Engineer",
    url: "https://rutvikbhanderi.dev",
    sameAs: [
      "https://github.com/Rutvik995",
      "https://www.linkedin.com/in/rutvikbhanderi",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rajkot",
      addressRegion: "Gujarat",
      addressCountry: "India",
    },
    knowsAbout: [
      "Agentic AI",
      "LangGraph",
      "Multi-Agent Systems",
      "Retrieval-Augmented Generation (RAG)",
      "Natural Language to SQL",
      "Machine Learning",
      "PostgreSQL",
      "FastAPI",
      "Python",
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
