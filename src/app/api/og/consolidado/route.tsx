/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadFonts() {
  const [jakartaBold, jakartaMedium, mono] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko70yygg_vbd-E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/plusjakartasans/v8/LDIYaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NShXUEKi4Rw.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf').then(r => r.arrayBuffer()),
  ]);
  return [
    { name: 'Jakarta', data: jakartaBold, style: 'normal' as const, weight: 700 as const },
    { name: 'JakartaMed', data: jakartaMedium, style: 'normal' as const, weight: 500 as const },
    { name: 'Mono', data: mono, style: 'normal' as const, weight: 400 as const },
  ];
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const token = p.get('token');
  if (token !== (process.env.OG_SECRET || 'NT_OG_2026')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const total = parseInt(p.get('total') || '0');
  const certificados = parseInt(p.get('cert') || '0');
  const sinCert = parseInt(p.get('nocert') || '0');
  // Up to 5 highlight picks as comma-separated: "tipster|apuesta|cuota|hora"
  const highlights = (p.get('picks') || '').split(';;').filter(Boolean).slice(0, 5);

  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0B1120',
          fontFamily: 'JakartaMed',
          color: '#F1F5F9',
        }}
      >
        {/* ── Accent bar ── */}
        <div style={{ display: 'flex', width: '100%', height: '4px', background: 'linear-gradient(90deg, #00D1B2, #3B82F6, #F59E0B)' }} />

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'Jakarta', fontSize: '28px', letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>CONSOLIDADO VIP</div>
          </div>
          <div style={{ display: 'flex', fontSize: '15px', color: '#64748B' }}>
            {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* ── Main card ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            margin: '0 48px',
            padding: '28px 40px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)',
            border: '1px solid #1E293B',
          }}
        >
          {/* ── Summary stats ── */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: '#1E293B', borderRadius: '12px 0 0 12px' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>TOTAL ANÁLISIS</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '42px', color: '#00D1B2' }}>{total}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>CERTIFICADOS IA</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '42px', color: '#10B981' }}>{certificados}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>SIN CERTIFICAR</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '42px', color: '#94A3B8' }}>{sinCert}</div>
            </div>
          </div>

          {/* ── Highlight picks ── */}
          {highlights.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>
                DESTACADOS
              </div>
              {highlights.map((h, i) => {
                const parts = h.split('|');
                const tipsterH = parts[0] || '';
                const apuestaH = parts[1] || '';
                const cuotaH = parts[2] || '';
                const horaH = parts[3] || '';
                const isCert = parts[4] === '1';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: isCert ? 'rgba(16,185,129,0.06)' : 'rgba(148,163,184,0.04)',
                      borderLeft: `3px solid ${isCert ? '#10B981' : '#475569'}`,
                    }}
                  >
                    <div style={{ display: 'flex', fontSize: '13px', color: '#94A3B8', minWidth: '90px' }}>{tipsterH}</div>
                    <div style={{ display: 'flex', flex: 1, fontSize: '14px', color: '#E2E8F0' }}>
                      {apuestaH.length > 40 ? apuestaH.substring(0, 40) + '...' : apuestaH}
                    </div>
                    <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#00D1B2' }}>@{cuotaH}</div>
                    {horaH && <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '13px', color: '#64748B' }}>{horaH}</div>}
                  </div>
                );
              })}
              {total > highlights.length && (
                <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', marginTop: '4px', paddingLeft: '16px' }}>
                  +{total - highlights.length} análisis más en neurotips.io
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>
            Verificar primero. Publicar después.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
