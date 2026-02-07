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

  const green = parseInt(p.get('green') || '0');
  const red = parseInt(p.get('red') || '0');
  const nulas = parseInt(p.get('nulas') || '0');
  const pendientes = parseInt(p.get('pendientes') || '0');
  const efectividad = p.get('efectividad') || '0';
  const ganancia = p.get('ganancia') || '$0.00';
  const rendimiento = p.get('rendimiento') || '+0.0%';
  const histTotal = p.get('hist_total') || '';
  const histEfect = p.get('hist_efect') || '';
  const histYield = p.get('hist_yield') || '';
  const tipo = p.get('tipo') || 'vip'; // vip | free

  const total = green + red;
  const isPositive = parseFloat(ganancia.replace(/[^0-9.-]/g, '')) >= 0;
  const dayEmoji = parseFloat(efectividad) >= 60 ? '🔥' : parseFloat(efectividad) >= 50 ? '💪' : '📊';
  const isVip = tipo === 'vip';

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
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, #10B981, #3B82F6, ${isPositive ? '#F59E0B' : '#EF4444'})`,
          }}
        />

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'Jakarta', fontSize: '28px', letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '13px', color: '#64748B', letterSpacing: '1px' }}>
              {isVip ? 'CIERRE VIP' : 'CIERRE'}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: '15px', color: '#64748B' }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
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
          {/* ── Title row ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ fontFamily: 'Jakarta', fontSize: '14px', letterSpacing: '2px', color: '#00D1B2' }}>
              CIERRE DE JORNADA
            </div>
            {isVip && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: 'rgba(16,185,129,0.1)',
                  color: '#10B981',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              >
                Solo Certificados IA
              </div>
            )}
          </div>

          {/* ── Big stats ── */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
            {/* Aciertos */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px 0 0 12px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>ACIERTOS</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '48px', color: '#10B981' }}>{green}</div>
            </div>
            {/* Fallos */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>FALLOS</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '48px', color: '#EF4444' }}>{red}</div>
            </div>
            {/* Efectividad */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>EFECTIVIDAD</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '48px', color: '#F1F5F9' }}>{efectividad}%</div>
            </div>
            {/* Ganancia */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 24px', background: '#1E293B', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>GANANCIA</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '40px', color: isPositive ? '#10B981' : '#EF4444' }}>{ganancia}</div>
            </div>
          </div>

          {/* ── Secondary metrics ── */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Rendimiento</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{rendimiento}</div>
            </div>
            {nulas > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#94A3B8' }}>Nulas: {nulas}</div>
              </div>
            )}
            {pendientes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ display: 'flex', fontSize: '14px', color: '#F59E0B' }}>Pendientes: {pendientes}</div>
              </div>
            )}
          </div>

          {/* ── Histórico (if available) ── */}
          {histTotal && parseInt(histTotal) >= 10 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 20px',
                borderRadius: '10px',
                background: 'rgba(0,209,178,0.06)',
                border: '1px solid rgba(0,209,178,0.15)',
                marginTop: '8px',
              }}
            >
              <div style={{ display: 'flex', fontSize: '13px', color: '#00D1B2', letterSpacing: '1px' }}>HISTÓRICO IA</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#94A3B8' }}>{histTotal} análisis</div>
              <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>·</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#F1F5F9' }}>{histEfect}%</div>
              <div style={{ display: 'flex', fontSize: '14px', color: '#64748B' }}>·</div>
              <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: '14px', color: '#10B981' }}>{histYield}</div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px 20px' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '13px', color: '#475569' }}>
            Los datos no mienten. La IA tampoco.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
