/**
 * API Certification — Client para endpoints de certificación IA v2.0
 * 
 * Nuevos endpoints:
 * - GET  /api/public/stats-reales         → Stats reales (reemplaza hardcoded)
 * - GET  /api/public/ia-transparency      → Transparencia IA (4 escenarios)
 * - GET  /api/public/tipster/:id/certificacion → Reporte de tipster
 * - GET  /api/public/picks-certificados   → Picks del día con cert_level
 * - POST /api/admin/certificacion/sync    → Backfill (admin only)
 * 
 * Endpoints existentes mejorados (ahora incluyen cert_level):
 * - GET /api/public/combinada-ia          → Combinada con cert badges
 * - GET /api/public/dashboard-ia          → Dashboard con cert levels
 * - GET /api/picks/recomendados           → Recomendados con cert
 * - GET /api/analisis-ia/:id              → Análisis con cert
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export type CertLevel = 'TRIPLE_CHECK' | 'DOUBLE_CHECK' | 'SINGLE_CHECK' | 'REJECTED' | 'PENDING';

export interface CertInfo {
  cert_level: CertLevel;
  cert_emoji: string;
  cert_label: string;
  cert_color: string;
  cert_confidence: number;
}

export interface PlatformStats {
  global: {
    total_picks: number;
    ganadas: number;
    perdidas: number;
    pendientes: number;
    win_rate: number;
    roi: number;
    profit_total: number;
    total_apostado: number;
    cuota_promedio: number;
  };
  mes_actual: {
    total: number;
    ganadas: number;
    perdidas: number;
    win_rate: number;
    roi: number;
    profit: number;
  };
  por_filtro_ia: Record<string, {
    total: number;
    ganadas: number;
    perdidas: number;
    win_rate: number;
    roi: number;
    profit: number;
  }>;
  tipsters_activos: number;
  perfiles_ia: number;
}

export interface IATransparencyData {
  por_filtro: Record<string, any>;
  por_cert_level: Record<string, any>;
  escenarios: Record<string, {
    count: number;
    emoji: string;
    label: string;
    description: string;
  }>;
  total_con_filtro: number;
  beneficio_neto_ia: number;
  historial_mensual: Record<string, any>;
  resumen: {
    aprobada_wr: number;
    rechazada_wr: number;
    diferencia: number;
    total_analizado: number;
    mensaje: string;
  };
}

export interface TipsterCertReport {
  tipster: { id: number; alias: string; deporte: string };
  certificacion: { nivel: string; tiene_perfil_ia: boolean; total_picks_auditados: number };
  stats: { total: number; ganadas: number; perdidas: number; win_rate: number; roi: number; profit: number; cuota_promedio: number };
  rachas: { actual: number; mejor_positiva: number; peor_negativa: number };
  por_filtro_ia: Record<string, any>;
  por_mercado: Array<{ mercado: string; total: number; ganadas: number; win_rate: number; roi: number }>;
  perfil_ia: { specialty: string | null; golden_rules: string[]; blacklist: string[]; markets: Record<string, any> };
}

// ═══════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ── Public endpoints (no auth) ──

export const getStatsReales = () =>
  fetchJSON<PlatformStats>(`${API_BASE}/api/public/stats-reales`);

export const getIATransparency = () =>
  fetchJSON<IATransparencyData>(`${API_BASE}/api/public/ia-transparency`);

export const getTipsterCertificacion = (tipsterId: number) =>
  fetchJSON<TipsterCertReport>(`${API_BASE}/api/public/tipster/${tipsterId}/certificacion`);

export const getPicksCertificados = () =>
  fetchJSON<any>(`${API_BASE}/api/public/picks-certificados`);

// ── Admin endpoints (JWT required) ──

export const syncCertificacion = (token: string) =>
  fetchJSON<{ success: boolean; apuestas_procesadas: number; message: string }>(
    `${API_BASE}/api/admin/certificacion/sync`,
    { method: 'POST', headers: authHeaders(token) }
  );

// ═══════════════════════════════════════════
// Utility: Cert Level display helpers
// ═══════════════════════════════════════════

export const CERT_DISPLAY: Record<CertLevel, {
  emoji: string;
  label: string;
  color: string;
  description: string;
}> = {
  TRIPLE_CHECK: {
    emoji: '✓✓✓',
    label: 'Certificado Premium',
    color: '#2ED573',
    description: 'Máxima confianza: NeuroScore ≥75, IA Aprobada, tipster rentable, mercado élite',
  },
  DOUBLE_CHECK: {
    emoji: '✓✓',
    label: 'Certificado',
    color: '#00D1B2',
    description: 'Alta confianza: NeuroScore ≥60, sin señales de riesgo',
  },
  SINGLE_CHECK: {
    emoji: '✓',
    label: 'Verificado',
    color: '#FFDD57',
    description: 'Confianza moderada: analizado por IA con resultado mixto',
  },
  REJECTED: {
    emoji: '✗',
    label: 'No recomendado',
    color: '#FF4757',
    description: 'La IA detectó señales de riesgo en este pick',
  },
  PENDING: {
    emoji: '⏳',
    label: 'Analizando',
    color: '#94A3B8',
    description: 'El análisis IA está en proceso',
  },
};

export function getCertDisplay(level: string) {
  return CERT_DISPLAY[level as CertLevel] || CERT_DISPLAY.PENDING;
}
