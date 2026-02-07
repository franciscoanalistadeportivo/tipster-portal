import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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
  const borderColor = isWin ? 'rgba(16,185,129,0.3)' : isLoss ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)';
  const tagText = isWin ? '¡ACIERTO!' : isLoss ? 'FALLO' : 'NULA';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', color: '#F1F5F9' }}>
        <div style={{ display: 'flex', width: '100%', height: '5px', background: mainColor }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B', letterSpacing: '2px' }}>RESULTADO</div>
          </div>
          <div style={{ display: 'flex', fontSize: '44px', color: mainColor }}>●</div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          margin: '0 48px', padding: '36px 40px', borderRadius: '16px',
          background: `linear-gradient(145deg, ${mainBg} 0%, #111827 100%)`,
          border: `1.5px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', fontSize: '44px', fontWeight: 700, letterSpacing: '-1px', color: mainColor, marginBottom: '10px' }}>{tagText}</div>
          <div style={{ display: 'flex', fontSize: '17px', color: '#94A3B8', marginBottom: '6px' }}>{tipster}{certificado ? ' · Certificado IA' : ''}</div>
          <div style={{ display: 'flex', fontSize: '24px', fontWeight: 700, marginBottom: '34px', color: '#E2E8F0' }}>
            {apuesta.length > 65 ? apuesta.substring(0, 65) + '...' : apuesta}
          </div>

          <div style={{ display: 'flex', gap: '3px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B', borderRadius: '14px 0 0 14px' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>CUOTA</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700 }}>@{cuota}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>GANANCIA</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, color: mainColor }}>{ganancia}</div>
            </div>
            {racha && parseInt(racha) !== 0 ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B', borderRadius: '0 14px 14px 0' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>RACHA</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, color: parseInt(racha) > 0 ? '#10B981' : '#EF4444' }}>
                {parseInt(racha) > 0 ? `${racha} seguidas` : `${Math.abs(parseInt(racha))} caídas`}
              </div>
            </div> : null}
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            {efectividad ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>Efectividad IA</div>
              <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700 }}>{efectividad}%</div>
            </div> : null}
            {rendimiento ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>Rendimiento IA</div>
              <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700 }}>{rendimiento}</div>
            </div> : null}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 48px 22px' }}>
          <div style={{ display: 'flex', fontSize: '15px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>Verificado por IA</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
