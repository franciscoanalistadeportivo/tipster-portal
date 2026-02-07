import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120', color: '#F1F5F9' }}>
        {/* Accent bar */}
        <div style={{ display: 'flex', width: '100%', height: '5px', background: `linear-gradient(90deg, ${accent}, #3B82F6)` }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 48px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px' }}>NEUROTIPS</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B', letterSpacing: '2px' }}>INTELIGENCIA DEPORTIVA</div>
          </div>
          <div style={{
            display: 'flex', padding: '6px 18px', borderRadius: '20px',
            border: `1.5px solid ${certificado ? '#10B981' : '#475569'}`,
            background: certificado ? 'rgba(16,185,129,0.12)' : 'rgba(71,85,105,0.1)',
            fontSize: '14px', color: certificado ? '#10B981' : '#94A3B8',
          }}>
            {certificado ? '● Certificado IA' : '○ Analizado por IA'}
          </div>
        </div>

        {/* Main card */}
        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          margin: '0 48px', padding: '32px 40px', borderRadius: '16px',
          background: 'linear-gradient(145deg, #111827 0%, #0F172A 100%)',
          border: '1px solid #1E293B',
        }}>
          {/* Tag + Deporte */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', fontSize: '14px', fontWeight: 700, letterSpacing: '3px', color: accent }}>{tag}</div>
            <div style={{ display: 'flex', fontSize: '14px', color: '#64748B', letterSpacing: '1px' }}>{deporte.toUpperCase()}</div>
          </div>

          {/* Tipster */}
          <div style={{ display: 'flex', fontSize: '17px', color: '#94A3B8', marginBottom: '6px' }}>{tipster}</div>
          {/* Apuesta */}
          <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, lineHeight: 1.3, marginBottom: '30px' }}>
            {apuesta.length > 65 ? apuesta.substring(0, 65) + '...' : apuesta}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B', borderRadius: '14px 0 0 14px' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>CUOTA</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, color: accent }}>{cuota}</div>
            </div>
            {mercado ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>MERCADO</div>
              <div style={{ display: 'flex', fontSize: '17px' }}>{mercado.substring(0, 18)}</div>
            </div> : null}
            {hora ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>HORA CL</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700 }}>{hora}</div>
            </div> : null}
            {isVip && stake ? <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 22px', background: '#1E293B', borderRadius: '0 14px 14px 0' }}>
              <div style={{ display: 'flex', fontSize: '11px', color: '#64748B', letterSpacing: '1.5px', marginBottom: '6px' }}>STAKE</div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700 }}>${stake}</div>
            </div> : null}
          </div>

          {/* Bottom metrics */}
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {efectividad ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>Efectividad</div>
              <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700 }}>{efectividad}%</div>
            </div> : null}
            {rendimiento ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>Rendimiento</div>
              <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700 }}>{rendimiento}</div>
            </div> : null}
            {racha && parseInt(racha) >= 2 ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>Racha</div>
              <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700 }}>{racha} seguidas</div>
            </div> : null}
            {prob ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
              <div style={{ display: 'flex', fontSize: '15px', color: '#94A3B8' }}>IA {prob}%</div>
              {ev ? <div style={{ display: 'flex', fontSize: '15px', fontWeight: 700, color: parseFloat(ev) >= 0 ? '#10B981' : '#EF4444' }}>EV {ev}%</div> : null}
            </div> : null}
            {zona ? <div style={{
              display: 'flex', fontSize: '13px', padding: '5px 14px', borderRadius: '12px',
              background: zona === 'ORO' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.12)',
              color: zona === 'ORO' ? '#F59E0B' : '#94A3B8',
              border: `1px solid ${zona === 'ORO' ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.25)'}`,
            }}>Zona {zona}</div> : null}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 48px 22px' }}>
          <div style={{ display: 'flex', fontSize: '15px', color: '#475569' }}>neurotips.io</div>
          <div style={{ display: 'flex', fontSize: '14px', color: '#475569' }}>Verificado por IA</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
