import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tipster Portal - Centro de Operaciones',
  description: 'Portal de análisis y seguimiento de tipsters deportivos con IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
