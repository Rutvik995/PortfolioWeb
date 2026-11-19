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
    <html lang="en" className="dark" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
      <body
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#02050f',
          color: '#f8fafc',
          userSelect: 'none',
        }}
      >
        {children}
      </body>
    </html>
  );
}
