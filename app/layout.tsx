import type { Metadata } from 'next';
import { DM_Serif_Display, Space_Grotesk } from 'next/font/google';
import './globals.css';

const headingFont = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-heading'
});

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: {
    default: 'DGEN Technologies',
    template: '%s | DGEN Technologies'
  },
  description: 'Unified control panel and placeholder website layout for DGEN technologies.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  );
}
