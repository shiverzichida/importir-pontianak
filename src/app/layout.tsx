import type { Metadata } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title:
    'Importir Pontianak | Jasa Impor, Sourcing & Forwarder China, Malaysia, Singapura ke Kalbar',
  description:
    'Platform jasa titip beli (1688, Taobao, Alibaba), forwarder door-to-door, dan transfer valas dari China, Malaysia/Kuching, dan Singapura langsung ke Pontianak & seluruh Kalimantan Barat.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased bg-paper text-slate-900">
        {children}
      </body>
    </html>
  );
}
