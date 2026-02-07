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

  const tipo = p.get('tipo') || 'vip';
  const tipster = p.get('tipster') || 'Tipster';
  const apuesta = p.get('apuesta') || 'Apuesta';
  const cuota = p.get('cuota') || '1.50';
  const mercado = p.get('mercado') || '';
  const hora = p.get('hora') || '';
  const efectividad = p.get('efectividad') || '';
  const rendimiento = p.get('rendimiento') || '';
  const racha = p.get('racha') || '';
  const ev = p.get('ev') || '';
  const prob = p.get('prob') || '';
  const zona = p.get('zona') || '';
  const certificado = p.get('cert') === '1';
  const stake = p.get('stake') || '';
  const deporte = p.get('deporte') || 'Fútbol';

  const isVip = tipo === 'vip';
  const accent = isVip ? '#F59E0B' : '#00D1B2';
  const tag = isVip ? 'ANÁLISIS VIP' : 'ANÁLISIS GRATIS';

  const [boldFont, monoFont] = await Promise.all([
    loadGoogleFont('Inter', '700'),
    loadGoogleFont('JetBrains Mono', '400'),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', fontFamily: 'Inter', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '4px', background: `linear-gradient(90deg, ${accent}, #3B82F6)` }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>INTELIGENCIA DEPORTIVA</div>
          </div>
          <div style={{ display: 'flex', padding: '6px 16px', borderRadius: '20px', border: `1px solid ${certificado ? '#10B981' : '#475569'}`, background: certificado ? 'rgba(16,185,129,0.1)' : 'rgba(71,85,105,0.1)', fontSize: '14px', color: certificado ? '#10B981' : '#94A3B8' }}>
            {certificado ? '● Certificado IA' : '○ Analizado por IA'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: '0 48px', padding: '32px 40px', borderRadius: '16px', background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)', border: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', fontSize: '13px', fontWeight: 700, letterSpacing: '2px', color: accent }}>{tag}</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>{deporte.toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', fontSize: '16px', color: '#94A3B8', marginBottom: '4px' }}>{tipster}</div>
          <div style={{ display: 'flex', fontSize: '26px', fontWeight: 700, marginBottom: '28px' }}>
            {apuesta.length > 70 ? apuesta.substring(0, 70) + '...' : apuesta}
          </div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B', borderRadius: '12px 0 0 12px' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>CUOTA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px', color: accent }}>{cuota}</div>
            </div>
            {mercado ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>MERCADO</div>
              <div style={{ display: 'flex', fontSize: '16px' }}>{mercado.substring(0, 18)}</div>
            </div> : null}
            {hora ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>HORA CL</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px' }}>{hora}</div>
            </div> : null}
            {isVip && stake ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>STAKE</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px' }}>${stake}</div>
            </div> : null}
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {efectividad ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Efectividad</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{efectividad}%</div>
            </div> : null}
            {rendimiento ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{rendimiento}</div>
            </div> : null}
            {racha && parseInt(racha) >= 2 ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Racha</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{racha} seguidas</div>
            </div> : null}
            {zona ? <div style={{ display: 'flex', fontSize: '12px', padding: '4px 12px', borderRadius: '12px', background: zona === 'ORO' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.15)', color: zona === 'ORO' ? '#F59E0B' : '#94A3B8', border: `1px solid ${zona === 'ORO' ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
              Zona {zona}
            </div> : null}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>Verificado por IA</div>
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
