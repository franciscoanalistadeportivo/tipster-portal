import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get('token') !== (process.env.OG_SECRET || 'NT_OG_2026')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const total = parseInt(p.get('total') || '0');
  const certificados = parseInt(p.get('cert') || '0');
  const sinCert = parseInt(p.get('nocert') || '0');
  const highlights = (p.get('picks') || '').split(';;').filter(Boolean).slice(0, 5);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '5px', background: 'linear-gradient(90deg, #00D1B2, #3B82F6, #F59E0B)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B', letterSpacing: '2px' }}>CONSOLIDADO VIP</div>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          margin: '0 48px', padding: '28px 40px', borderRadius: '16px',
          background: 'linear-gradient(145deg, #111827 0%, #0F172A 100%)',
          border: '1px solid #1E293B',
        }}>
          {/* Summary stats */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 26px', background: '#1E293B', borderRadius: '14px 0 0 14px' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '8px' }}>TOTAL ANÁLISIS</div>
              <div style={{ display: 'flex', fontSize: '46px', fontWeight: 700, color: '#00D1B2' }}>{total}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 26px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '8px' }}>CERTIFICADOS IA</div>
              <div style={{ display: 'flex', fontSize: '46px', fontWeight: 700, color: '#10B981' }}>{certificados}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 26px', background: '#1E293B', borderRadius: '0 14px 14px 0' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '8px' }}>SIN CERTIFICAR</div>
              <div style={{ display: 'flex', fontSize: '46px', fontWeight: 700, color: '#94A3B8' }}>{sinCert}</div>
            </div>
          </div>

          {/* Highlight picks */}
          {highlights.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '4px' }}>DESTACADOS</div>
            {highlights.map((h, i) => {
              const parts = h.split('|');
              const isCert = parts[4] === '1';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '11px 18px', borderRadius: '10px',
                  background: isCert ? 'rgba(16,185,129,0.06)' : 'rgba(148,163,184,0.04)',
                  borderLeft: `3px solid ${isCert ? '#10B981' : '#475569'}`,
                }}>
                  <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8', minWidth: '100px' }}>{parts[0] || ''}</div>
                  <div style={{ display: 'flex', flex: 1, fontSize: '15px', color: '#E2E8F0' }}>{(parts[1] || '').substring(0, 38)}</div>
                  <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700, color: '#00D1B2' }}>@{parts[2] || ''}</div>
                  {parts[3] ? <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>{parts[3]}</div> : null}
                </div>
              );
            })}
            {total > highlights.length ? <div style={{ display: 'flex', fontSize: '14px', color: '#64748B', marginTop: '6px', paddingLeft: '18px' }}>+{total - highlights.length} análisis más en neurotips.io</div> : null}
          </div> : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 48px 22px' }}>
          <div style={{ display: 'flex', fontSize: '15px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>Verificar primero. Publicar después.</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
