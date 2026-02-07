import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadGoogleFont(font: string, weight: string = '400') {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@${weight}&display=swap`;
  const css = await (await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  })).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`Font not found: ${font} ${weight}`);
  const resp = await fetch(match[1]);
  return await resp.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get('token') !== (process.env.OG_SECRET || 'NT_OG_2026')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const total = parseInt(p.get('total') || '0');
  const certificados = parseInt(p.get('cert') || '0');
  const sinCert = parseInt(p.get('nocert') || '0');
  const highlights = (p.get('picks') || '').split(';;').filter(Boolean).slice(0, 5);

  const [boldFont, monoFont] = await Promise.all([
    loadGoogleFont('Inter', '700'),
    loadGoogleFont('JetBrains Mono', '400'),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', fontFamily: 'Inter', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '4px', background: 'linear-gradient(90deg, #00D1B2, #3B82F6, #F59E0B)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>CONSOLIDADO VIP</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: '0 48px', padding: '28px 40px', borderRadius: '16px', background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)', border: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: '#1E293B', borderRadius: '12px 0 0 12px' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>TOTAL ANÁLISIS</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '42px', color: '#00D1B2' }}>{total}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>CERTIFICADOS IA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '42px', color: '#10B981' }}>{certificados}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 24px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '6px' }}>SIN CERTIFICAR</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '42px', color: '#94A3B8' }}>{sinCert}</div>
            </div>
          </div>
          {highlights.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>DESTACADOS</div>
            {highlights.map((h, i) => {
              const parts = h.split('|');
              const isCert = parts[4] === '1';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '8px', background: isCert ? 'rgba(16,185,129,0.06)' : 'rgba(148,163,184,0.04)', borderLeft: `3px solid ${isCert ? '#10B981' : '#475569'}` }}>
                  <div style={{ display: 'flex', fontSize: '13px', color: '#94A3B8', minWidth: '90px' }}>{parts[0] || ''}</div>
                  <div style={{ display: 'flex', flex: 1, fontSize: '14px', color: '#E2E8F0' }}>{(parts[1] || '').substring(0, 40)}</div>
                  <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#00D1B2' }}>@{parts[2] || ''}</div>
                  {parts[3] ? <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#64748B' }}>{parts[3]}</div> : null}
                </div>
              );
            })}
            {total > highlights.length ? <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', marginTop: '4px', paddingLeft: '16px' }}>+{total - highlights.length} análisis más en neurotips.io</div> : null}
          </div> : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>Verificar primero. Publicar después.</div>
        </div>
      </div>
    ),
    {
      width: 1200, height: 630,
      fonts: [
        { name: 'Inter', data: boldFont, style: 'normal' as const, weight: 700 as const },
        { name: 'JetBrains Mono', data: monoFont, style: 'normal' as const, weight: 400 as const },
      ],
    },
  );
}
