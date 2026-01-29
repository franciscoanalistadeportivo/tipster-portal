import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tipster Portal - Director de Riesgos',
  description: 'Portal de análisis y seguimiento de tipsters deportivos con IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
