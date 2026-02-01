import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeuroTips - Análisis de Tipsters con IA',
  description: 'Hacemos lo que el ojo humano no ve. Nuestro algoritmo detecta patrones de éxito y señales de riesgo antes de que coloques tu dinero.',
  keywords: 'tipsters, apuestas deportivas, betting, picks, pronósticos, IA, análisis, neurotips',
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
