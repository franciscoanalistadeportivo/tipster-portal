import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TipsterPortal - Club de Tipsters Premium',
  description: 'Accede a picks de alta confianza analizados por IA. Estadísticas en tiempo real. Resultados comprobables.',
  keywords: 'tipsters, apuestas deportivas, betting, picks, pronósticos, IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
