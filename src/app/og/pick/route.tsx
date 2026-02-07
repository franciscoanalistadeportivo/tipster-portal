/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// ── Shared font loader ──
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

  // ── Security ──
  const token = p.get('token');
  if (token !== (process.env.OG_SECRET || 'NT_OG_2026')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ── Params ──
  const tipo = p.get('tipo') || 'vip'; // vip | free
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
  const accentColor = isVip ? '#F59E0B' : '#00D1B2';
  const tagText = isVip ? 'ANÁLISIS VIP' : 'ANÁLISIS GRATIS';

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
          padding: '0',
          fontFamily: 'JakartaMed',
          color: '#F1F5F9',
        }}
      >
        {/* ── Accent bar top ── */}
        <div style={{ display: 'flex', width: '100%', height: '4px', background: `linear-gradient(90deg, ${accentColor}, #3B82F6)` }} />

        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 48px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'Jakarta', fontSize: '28px', letterSpacing: '-0.5px', color: '#F1F5F9' }}>
              NEUROTIPS
            </div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>
              INTELIGENCIA DEPORTIVA
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${certificado ? '#10B981' : '#475569'}`,
              background: certificado ? 'rgba(16,185,129,0.1)' : 'rgba(71,85,105,0.1)',
              fontSize: '14px',
              color: certificado ? '#10B981' : '#94A3B8',
            }}
          >
            {certificado ? '● Certificado IA' : '○ Analizado por IA'}
          </div>
        </div>

        {/* ── Main card ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            margin: '0 48px',
            padding: '32px 40px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)',
            border: '1px solid #1E293B',
          }}
        >
          {/* Tag + Deporte */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Jakarta',
                fontSize: '13px',
                letterSpacing: '2px',
                color: accentColor,
              }}
            >
              {tagText}
            </div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>
              {deporte.toUpperCase()}
            </div>
          </div>

          {/* Tipster + Apuesta */}
          <div style={{ display: 'flex', fontSize: '16px', color: '#94A3B8', marginBottom: '4px' }}>
            {tipster}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Jakarta',
              fontSize: '26px',
              lineHeight: '1.3',
              marginBottom: '28px',
              color: '#F1F5F9',
            }}
          >
            {apuesta.length > 70 ? apuesta.substring(0, 70) + '...' : apuesta}
          </div>

          {/* ── Stats row ── */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              marginBottom: '24px',
            }}
          >
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
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '24px', color: accentColor }}>{cuota}</div>
            </div>
            {/* Mercado */}
            {mercado && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: '16px 20px',
                  background: '#1E293B',
                }}
              >
                <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>MERCADO</div>
                <div style={{ display: 'flex', fontSize: '16px', color: '#F1F5F9' }}>{mercado.length > 18 ? mercado.substring(0,18) : mercado}</div>
              </div>
            )}
            {/* Hora */}
            {hora && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: '16px 20px',
                  background: '#1E293B',
                }}
              >
                <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>HORA CL</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '24px', color: '#F1F5F9' }}>{hora}</div>
              </div>
            )}
            {/* Stake (solo VIP) */}
            {isVip && stake && (
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
                <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>STAKE</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '24px', color: '#F1F5F9' }}>${stake}</div>
              </div>
            )}
          </div>

          {/* ── Bottom metrics ── */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {efectividad && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Efectividad</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{efectividad}%</div>
              </div>
            )}
            {rendimiento && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{rendimiento}</div>
              </div>
            )}
            {racha && parseInt(racha) >= 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Racha</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{racha} seguidas</div>
              </div>
            )}
            {prob && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>IA</div>
                <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{prob}%</div>
                {ev && <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: parseFloat(ev) >= 0 ? '#10B981' : '#EF4444' }}>EV {ev}%</div>}
              </div>
            )}
            {zona && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: zona === 'ORO' ? 'rgba(245,158,11,0.15)' : zona === 'PLATA' ? 'rgba(148,163,184,0.15)' : 'rgba(168,85,247,0.15)',
                  color: zona === 'ORO' ? '#F59E0B' : zona === 'PLATA' ? '#94A3B8' : '#A855F7',
                  border: `1px solid ${zona === 'ORO' ? 'rgba(245,158,11,0.3)' : zona === 'PLATA' ? 'rgba(148,163,184,0.3)' : 'rgba(168,85,247,0.3)'}`,
                }}
              >
                Zona {zona}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 48px 20px',
          }}
        >
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>
            neurotips.io
          </div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>
            Verificado por IA · {new Date().toLocaleDateString('es-CL')}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
