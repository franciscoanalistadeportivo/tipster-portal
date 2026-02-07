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

  const green = parseInt(p.get('green') || '0');
  const red = parseInt(p.get('red') || '0');
  const pendientes = parseInt(p.get('pendientes') || '0');
  const efectividad = p.get('efectividad') || '0';
  const ganancia = p.get('ganancia') || '$0.00';
  const rendimiento = p.get('rendimiento') || '+0.0%';
  const histTotal = p.get('hist_total') || '';
  const histEfect = p.get('hist_efect') || '';
  const histYield = p.get('hist_yield') || '';
  const tipo = p.get('tipo') || 'vip';
  const isPositive = !ganancia.includes('-');
  const isVip = tipo === 'vip';

  const [boldFont, monoFont] = await Promise.all([
    loadGoogleFont('Inter', '700'),
    loadGoogleFont('JetBrains Mono', '400'),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', fontFamily: 'Inter', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '4px', background: `linear-gradient(90deg, #10B981, #3B82F6, ${isPositive ? '#F59E0B' : '#EF4444'})` }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>{isVip ? 'CIERRE VIP' : 'CIERRE'}</div>
          </div>
          {isVip ? <div style={{ display: 'flex', fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>Solo Certificados IA</div> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: '0 48px', padding: '32px 40px', borderRadius: '16px', background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)', border: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: '#00D1B2', marginBottom: '28px' }}>CIERRE DE JORNADA</div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px 0 0 12px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>ACIERTOS</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '48px', color: '#10B981' }}>{green}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>FALLOS</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '48px', color: '#EF4444' }}>{red}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>EFECTIVIDAD</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '48px' }}>{efectividad}%</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>GANANCIA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '40px', color: isPositive ? '#10B981' : '#EF4444' }}>{ganancia}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{rendimiento}</div>
            </div>
            {pendientes > 0 ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#F59E0B' }}>Pendientes: {pendientes}</div>
            </div> : null}
          </div>
          {histTotal && parseInt(histTotal) >= 10 ? <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: '10px', background: 'rgba(0,209,178,0.06)', border: '1px solid rgba(0,209,178,0.15)', marginTop: '8px' }}>
            <div style={{ display: 'flex', fontSize: '13px', color: '#00D1B2', letterSpacing: '1px' }}>HISTÓRICO IA</div>
            <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#94A3B8' }}>{histTotal} análisis</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>·</div>
            <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{histEfect}%</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>·</div>
            <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#10B981' }}>{histYield}</div>
          </div> : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>Los datos no mienten. La IA tampoco.</div>
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
