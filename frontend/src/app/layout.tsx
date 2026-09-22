import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'PrivacyPay | Privacy-First SaaS Subscriptions on Midnight Network',
  description: 'Privacy-preserving SaaS recurring subscription infrastructure with fiat-friendly payments powered by Midnight Network zero-knowledge contracts.',
  keywords: ['Midnight Network', 'Compact', 'Zero Knowledge', 'Privacy', 'SaaS Subscriptions', 'Fiat Payments']
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
