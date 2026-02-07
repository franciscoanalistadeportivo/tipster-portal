'use client';

/**
 * CombinadaLegs — Muestra cada selección de una combinada de forma clara
 * ============================================================================
 * ARCHIVO: src/components/CombinadaLegs.tsx
 * DROP-IN: Copiar a tu proyecto Next.js 14
 *
 * REGLAS CUMPLIDAS:
 * ✅ REGLA #1 NEUROMARKETING: Pattern interrupt rosa para combinadas
 * ✅ REGLA #2 SEGURIDAD: Sin datos sensibles, sin IDs internos
 * ✅ REGLA #3 IDENTIDAD: Paleta oficial cyan/verde/rosa
 * ✅ REGLA #4 SIN DINERO: Solo cuotas, nunca montos reales
 * ✅ REGLA #5 ESPAÑOL: 100% español LATAM
 * ✅ ANTIVULNERABILIDAD: Parseo defensivo, cero hardcodeo de datos
 *
 * SOPORTA:
 * 1. String existente del backend → parsea "Partido1: Pick1 + Partido2: Pick2"
 * 2. Array selecciones[] futuro → render directo sin parseo
 * 3. Fallback seguro → si no puede parsear, muestra texto original
 * ============================================================================
 */

import React from 'react';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
interface Seleccion {
  partido: string;
  pick: string;
  cuota?: number;
  estado?: 'pendiente' | 'ganada' | 'perdida' | 'nula';
}

interface CombinadaLegsProps {
  /** Texto completo de la apuesta (backend actual) */
  textoApuesta: string;
  /** Array de selecciones individuales (backend futuro) */
  selecciones?: Seleccion[];
  /** Cuota total de la combinada */
  cuotaTotal: number;
  /** Resultado global */
  resultado?: string;
  /** Modo compacto para cards pequeñas (apuestas) vs expandido (IA Picks) */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════
// PARSER — Extrae selecciones del texto del backend
// ═══════════════════════════════════════════════════════
/**
 * Parsea el texto de una combinada del backend.
 * 
 * Formatos soportados:
 * - "COMBINADA (2) - FC St. Pauli - VfB Stuttgart: Más 0.5 goles + FC Nantes - O. Lyonnais: Gana O. Lyonnais"
 * - "FC St. Pauli - VfB Stuttgart: Más 0.5 goles + FC Nantes - O. Lyonnais: Gana O. Lyonnais"
 * - "Partido1 + Partido2" (sin picks separados)
 * 
 * Estrategia: split por " + " → cada parte split por último ": " encontrado
 */
function parseCombinadaText(texto: string): Seleccion[] {
  if (!texto || typeof texto !== 'string') return [];

  // Limpiar prefijo "COMBINADA (N) - " si existe
  let cleaned = texto.replace(/^COMBINADA\s*\(\d+\)\s*[-–—]\s*/i, '').trim();

  // Split por " + " (separador entre selecciones)
  const parts = cleaned.split(/\s*\+\s*/);

  if (parts.length <= 1) {
    // No se pudo separar → retornar como una sola selección
    return [{ partido: cleaned, pick: '' }];
  }

  return parts.map(part => {
    const trimmed = part.trim();

    // Buscar el último ": " para separar partido de pick
    // Usamos lastIndexOf porque los partidos pueden contener ":"
    const lastColon = trimmed.lastIndexOf(': ');

    if (lastColon > 0 && lastColon < trimmed.length - 2) {
      return {
        partido: trimmed.substring(0, lastColon).trim(),
        pick: trimmed.substring(lastColon + 2).trim(),
      };
    }

    // Alternativa: buscar patrones comunes de picks después de " - "
    // "FC Nantes - O. Lyonnais Gana O. Lyonnais" → separar por verbos de pick
    const pickPatterns = /\b(Gana|Ganador|Más de|Menos de|Over|Under|Ambos|Handicap|Draw no bet|Apuesta sin empate|Gana cualquiera)/i;
    const match = trimmed.match(pickPatterns);
    if (match && match.index && match.index > 5) {
      return {
        partido: trimmed.substring(0, match.index).trim().replace(/[-–—]\s*$/, '').trim(),
        pick: trimmed.substring(match.index).trim(),
      };
    }

    // Fallback: todo es el texto del partido
    return { partido: trimmed, pick: '' };
  });
}

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
export default function CombinadaLegs({
  textoApuesta,
  selecciones,
  cuotaTotal,
  resultado,
  compact = false,
}: CombinadaLegsProps) {
  // Priorizar array de selecciones si viene del backend futuro
  const legs: Seleccion[] = selecciones && selecciones.length > 0
    ? selecciones
    : parseCombinadaText(textoApuesta);

  // Si solo hay 1 leg o no se pudo parsear, no renderizar como combinada
  if (legs.length <= 1 && !selecciones?.length) {
    return (
      <p className="text-white font-medium text-[15px] mb-2 leading-snug">
        {textoApuesta}
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden ${compact ? 'my-1' : 'my-2'}`}
      style={{
        border: '1px solid rgba(255, 107, 157, 0.12)',
        background: 'rgba(255, 107, 157, 0.02)',
      }}
    >
      {/* ── Header badge ── */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: compact ? '5px 10px' : '6px 12px',
          background: 'rgba(255, 107, 157, 0.06)',
          borderBottom: '1px solid rgba(255, 107, 157, 0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-extrabold tracking-wider"
            style={{
              fontSize: '9px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 107, 157, 0.15)',
              color: '#FF6B9D',
              letterSpacing: '0.05em',
            }}
          >
            COMBINADA
          </span>
          <span className="text-[10px] text-slate-500">
            {legs.length} selecciones
          </span>
        </div>
        <span
          className="font-mono font-extrabold"
          style={{
            fontSize: compact ? '12px' : '14px',
            color: '#FF6B9D',
          }}
        >
          @{Number(cuotaTotal || 0).toFixed(2)}
        </span>
      </div>

      {/* ── Individual legs ── */}
      {legs.map((leg, i) => {
        const estado = leg.estado || (resultado === 'GANADA' ? 'ganada' : resultado === 'PERDIDA' ? 'perdida' : resultado === 'NULA' ? 'nula' : 'pendiente');
        const estadoConfig = {
          ganada: { icon: '✓', color: '#22C55E', label: 'Acierto' },
          perdida: { icon: '✗', color: '#EF4444', label: 'Fallo' },
          nula: { icon: '—', color: '#94A3B8', label: 'Nula' },
          pendiente: { icon: '⏳', color: '#00D1FF', label: 'Pendiente' },
        };
        const ec = estadoConfig[estado] || estadoConfig.pendiente;

        return (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{
              padding: compact ? '6px 10px' : '8px 12px',
              borderBottom: i < legs.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
            }}
          >
            {/* Leg number */}
            <div
              className="flex-shrink-0 flex items-center justify-center font-mono font-extrabold"
              style={{
                width: compact ? '20px' : '24px',
                height: compact ? '20px' : '24px',
                borderRadius: '6px',
                background: 'rgba(255, 107, 157, 0.08)',
                border: '1px solid rgba(255, 107, 157, 0.15)',
                fontSize: compact ? '9px' : '10px',
                color: '#FF6B9D',
              }}
            >
              {i + 1}
            </div>

            {/* Match + Pick */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-white leading-snug"
                style={{ fontSize: compact ? '11px' : '12px' }}
              >
                {leg.partido}
              </p>
              {leg.pick && (
                <p
                  className="font-medium mt-0.5"
                  style={{
                    fontSize: compact ? '10px' : '11px',
                    color: '#00D1FF',
                  }}
                >
                  {leg.pick}
                </p>
              )}
            </div>

            {/* Cuota individual + Estado */}
            <div className="flex-shrink-0 text-right">
              {leg.cuota && (
                <span
                  className="font-mono font-bold block"
                  style={{
                    fontSize: compact ? '11px' : '12px',
                    color: '#00D1FF',
                  }}
                >
                  @{leg.cuota.toFixed(2)}
                </span>
              )}
              <span
                className="flex items-center justify-end gap-1 font-bold"
                style={{
                  fontSize: '9px',
                  color: ec.color,
                  marginTop: leg.cuota ? '2px' : '0',
                }}
              >
                <span>{ec.icon}</span>
                <span>{ec.label}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HELPER — Detecta si una apuesta es combinada
// Usar en los pages para decidir si renderizar CombinadaLegs
// ═══════════════════════════════════════════════════════
export function esCombinada(apuesta: { tipo_mercado?: string; apuesta?: string }): boolean {
  if (apuesta.tipo_mercado === 'COMBINADAS') return true;
  if (apuesta.tipo_mercado?.toUpperCase().includes('COMBI')) return true;
  // Fallback: detectar por texto
  if (apuesta.apuesta?.includes(' + ') && apuesta.apuesta.split(' + ').length >= 2) return true;
  return false;
}
