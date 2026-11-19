import type { Metadata } from 'next';
import './globals.css';
import { portfolioConfig } from '@/config/portfolio.config';

export const metadata: Metadata = {
  title: `${portfolioConfig.developer.name} — ${portfolioConfig.developer.role}`,
  description: portfolioConfig.developer.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#02050f] text-slate-100 overflow-x-hidden select-none">
        {children}
      </body>
    </html>
  );
}
