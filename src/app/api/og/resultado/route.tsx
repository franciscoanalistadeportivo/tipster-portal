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

  // Colors
  const mainColor = isWin ? '#10B981' : isLoss ? '#EF4444' : '#94A3B8';
  const mainBg = isWin ? 'rgba(16,185,129,0.08)' : isLoss ? 'rgba(239,68,68,0.06)' : 'rgba(148,163,184,0.06)';
  const accentBorder = isWin ? 'rgba(16,185,129,0.3)' : isLoss ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)';
  const tagText = isWin ? '¡ACIERTO!' : isLoss ? 'FALLO' : 'NULA';
  const dotChar = isWin ? '●' : isLoss ? '●' : '○';

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
        <div style={{ display: 'flex', width: '100%', height: '4px', background: mainColor }} />

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'Jakarta', fontSize: '28px', letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>RESULTADO</div>
          </div>
          <div style={{ display: 'flex', fontSize: '40px', color: mainColor }}>{dotChar}</div>
        </div>

        {/* ── Main card ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            margin: '0 48px',
            padding: '36px 40px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${mainBg} 0%, #111827 100%)`,
            border: `1px solid ${accentBorder}`,
          }}
        >
          {/* Result tag */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Jakarta',
              fontSize: '40px',
              letterSpacing: '-1px',
              color: mainColor,
              marginBottom: '8px',
            }}
          >
            {tagText}
          </div>

          {/* Tipster */}
          <div style={{ display: 'flex', fontSize: '16px', color: '#94A3B8', marginBottom: '4px' }}>
            {tipster} {certificado ? '· Certificado IA' : ''}
          </div>

          {/* Apuesta */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Jakarta',
              fontSize: '22px',
              marginBottom: '32px',
              color: '#E2E8F0',
            }}
          >
            {apuesta.length > 70 ? apuesta.substring(0, 70) + '...' : apuesta}
          </div>

          {/* ── Stats grid ── */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '28px' }}>
            {/* Cuota */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '16px 20px',
                background: '#1E293B',
                borderRadius: '12px 0 0 12px',
              }}
            >
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>CUOTA</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '24px', color: '#F1F5F9' }}>@{cuota}</div>
            </div>

            {/* Ganancia */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '16px 20px',
                background: '#1E293B',
              }}
            >
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>GANANCIA</div>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Mono',
                  fontSize: '24px',
                  color: mainColor,
                }}
              >
                {ganancia}
              </div>
            </div>

            {/* Racha */}
            {racha && parseInt(racha) !== 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: '16px 20px',
                  background: '#1E293B',
                  borderRadius: '0 12px 12px 0',
                }}
              >
                <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>RACHA</div>
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Mono',
                    fontSize: '24px',
                    color: parseInt(racha) > 0 ? '#10B981' : '#EF4444',
                  }}
                >
                  {parseInt(racha) > 0 ? `${racha} seguidas` : `${Math.abs(parseInt(racha))} caídas`}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom metrics ── */}
          <div style={{ display: 'flex', gap: '32px' }}>
            {efectividad && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Efectividad IA</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{efectividad}%</div>
              </div>
            )}
            {rendimiento && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento IA</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{rendimiento}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>
            Verificado por IA · {new Date().toLocaleDateString('es-CL')}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
