// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Navbar from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'RifasApp — Crea y gestiona tus rifas online',
  description:
    'La plataforma más fácil para organizar rifas. Regístrate con tu Gmail, elige una plantilla, selecciona la cantidad de números y empieza a vender.',
  keywords: 'rifas, rifa online, vender números, organizar rifa, Colombia',
  openGraph: {
    title: 'RifasApp — Tu plataforma de rifas',
    description: 'Crea y gestiona rifas online de forma fácil y segura',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
