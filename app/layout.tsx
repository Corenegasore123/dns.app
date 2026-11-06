import type { Metadata } from 'next';
// Self-hosted Geist (same font as the website): no Google Fonts download at build time
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Admin | Duhingeneza Shop',
    template: '%s | DNS Admin',
  },
  description: 'Duhingeneza Shop admin dashboard',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
