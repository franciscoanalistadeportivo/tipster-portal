import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get('token') !== (process.env.OG_SECRET || 'NT_OG_2026')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tipster = p.get('tipster') || 'Tipster';
  const apuesta = p.get('apuesta') || 'Apuesta';
  const cuota = p.get('cuota') || '1.50';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', color: '#F1F5F9', padding: '48px' }}>
        <div style={{ display: 'flex', fontSize: '32px', fontWeight: 700 }}>NEUROTIPS</div>
        <div style={{ display: 'flex', fontSize: '20px', color: '#94A3B8', marginTop: '24px' }}>{tipster}</div>
        <div style={{ display: 'flex', fontSize: '28px', marginTop: '8px' }}>{apuesta}</div>
        <div style={{ display: 'flex', fontSize: '36px', color: '#00D1B2', marginTop: '24px' }}>@{cuota}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
