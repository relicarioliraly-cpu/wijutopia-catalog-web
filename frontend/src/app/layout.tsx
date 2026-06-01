import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import LegalModal from '@/components/LegalModal';
import BackendStatus from '@/components/BackendStatus';
import SiteNav from '@/components/SiteNav';

export const metadata: Metadata = {
  title: 'Wijutopia TCG E-Commerce | Prototipo Académico',
  description: 'Plataforma full-stack de prueba para comercio electrónico TCG con Next.js, Express y MySQL.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body>
        <LegalModal />
        <SiteNav />
        <BackendStatus />
        {children}
      </body>
    </html>
  );
}
