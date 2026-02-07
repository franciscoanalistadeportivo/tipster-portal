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

  const resultado = (p.get('resultado') || 'GANADA').toUpperCase();
  const tipster = p.get('tipster') || 'Tipster';
  const apuesta = p.get('apuesta') || 'Apuesta';
  const cuota = p.get('cuota') || '1.50';
  const ganancia = p.get('ganancia') || '+$0.00';
  const racha = p.get('racha') || '';
  const efectividad = p.get('efectividad') || '';
  const rendimiento = p.get('rendimiento') || '';
  const certificado = p.get('cert') === '1';

  const isWin = resultado === 'GANADA';
  const isLoss = resultado === 'PERDIDA';
  const mainColor = isWin ? '#10B981' : isLoss ? '#EF4444' : '#94A3B8';
  const mainBg = isWin ? 'rgba(16,185,129,0.08)' : isLoss ? 'rgba(239,68,68,0.06)' : 'rgba(148,163,184,0.06)';
  const tagText = isWin ? '¡ACIERTO!' : isLoss ? 'FALLO' : 'NULA';

  const [boldFont, monoFont] = await Promise.all([
    loadGoogleFont('Inter', '700'),
    loadGoogleFont('JetBrains Mono', '400'),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', fontFamily: 'Inter', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '4px', background: mainColor }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>RESULTADO</div>
          </div>
          <div style={{ display: 'flex', fontSize: '40px', color: mainColor }}>●</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: '0 48px', padding: '36px 40px', borderRadius: '16px', background: `linear-gradient(135deg, ${mainBg} 0%, #111827 100%)`, border: `1px solid ${isWin ? 'rgba(16,185,129,0.3)' : isLoss ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)'}` }}>
          <div style={{ display: 'flex', fontSize: '40px', fontWeight: 700, letterSpacing: '-1px', color: mainColor, marginBottom: '8px' }}>{tagText}</div>
          <div style={{ display: 'flex', fontSize: '16px', color: '#94A3B8', marginBottom: '4px' }}>{tipster}{certificado ? ' · Certificado IA' : ''}</div>
          <div style={{ display: 'flex', fontSize: '22px', fontWeight: 700, marginBottom: '32px', color: '#E2E8F0' }}>
            {apuesta.length > 70 ? apuesta.substring(0, 70) + '...' : apuesta}
          </div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B', borderRadius: '12px 0 0 12px' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>CUOTA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px' }}>@{cuota}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>GANANCIA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px', color: mainColor }}>{ganancia}</div>
            </div>
            {racha && parseInt(racha) !== 0 ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 20px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>RACHA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '24px', color: parseInt(racha) > 0 ? '#10B981' : '#EF4444' }}>
                {parseInt(racha) > 0 ? `${racha} seguidas` : `${Math.abs(parseInt(racha))} caídas`}
              </div>
            </div> : null}
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            {efectividad ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Efectividad IA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{efectividad}%</div>
            </div> : null}
            {rendimiento ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento IA</div>
              <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{rendimiento}</div>
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
