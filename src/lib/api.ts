/**
 * API Client - Conexión segura al backend
 * Versión 2.1 - Token persistente en localStorage
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

let accessToken: string | null = null;
let refreshToken: string | null = null;

// Cargar tokens de localStorage al iniciar
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('token');
  refreshToken = localStorage.getItem('refresh_token');
}

// Cliente para endpoints protegidos (con JWT)
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Cliente para endpoints públicos (sin JWT)
const publicApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    // Intentar obtener token de memoria o localStorage
    const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newToken = response.data.access_token;
        setTokens(newToken, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
  }
};

export const loadTokens = () => {
  if (typeof window !== 'undefined') {
    const storedAccess = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refresh_token');
    if (storedAccess) accessToken = storedAccess;
    if (storedRefresh) refreshToken = storedRefresh;
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token') || !!accessToken;
  }
  return !!accessToken;
};

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  register: async (email: string, password: string, nombre: string) => {
    const response = await api.post('/api/auth/register', { email, password, nombre });
    if (response.data.access_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },
  logout: () => clearTokens(),
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============================================================================
// DASHBOARD API
// ============================================================================
export const dashboardAPI = {
  getData: async () => {
    const response = await publicApi.get('/api/public/dashboard');
    return response.data;
  },
};

// ============================================================================
// TIPSTERS API
// ============================================================================
export const tipstersAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/tipsters');
      return response.data;
    } catch (error) {
      try {
        const publicResponse = await publicApi.get('/api/public/tipsters');
        return publicResponse.data;
      } catch (publicError) {
        try {
          const dashboard = await dashboardAPI.getData();
          return { tipsters: dashboard.tipsters_list || [], total: dashboard.tipsters?.total || 0 };
        } catch {
          return { tipsters: [], total: 0 };
        }
      }
    }
  },
  getById: async (id: number) => {
    const safeId = Math.abs(Math.floor(Number(id)));
    if (!safeId || safeId <= 0 || safeId > 999999) {
      return null;
    }
    
    try {
      const response = await api.get(`/api/tipsters/${safeId}`);
      return response.data;
    } catch (error) {
      try {
        const publicResponse = await publicApi.get(`/api/public/tipsters/${safeId}`);
        return publicResponse.data;
      } catch {
        return null;
      }
    }
  },
};

// ============================================================================
// BANCA API (Legacy)
// ============================================================================
export const bancaAPI = {
  get: async () => {
    const response = await api.get('/api/usuario/banca');
    return response.data;
  },
  update: async (banca: number) => {
    const response = await api.put('/api/usuario/banca', { banca });
    return response.data;
  },
};

// ============================================================================
// MI BANCA API (Nuevo v7)
// ============================================================================
export const miBancaAPI = {
  setup: async (data: {
    banca_inicial: number;
    perfil_riesgo: 'conservador' | 'moderado' | 'agresivo';
    deportes_interes: string[];
    casa_apuestas: string;
    meta_mensual: number;
  }) => {
    const response = await api.post('/api/banca/setup', data);
    return response.data;
  },

  getEstado: async () => {
    const response = await api.get('/api/banca/estado');
    return response.data;
  },

  actualizar: async (data: Partial<{
    perfil_riesgo: string;
    deportes_interes: string[];
    casa_apuestas: string;
    meta_mensual: number;
    banca_actual: number;
  }>) => {
    const response = await api.put('/api/banca/actualizar', data);
    return response.data;
  },

  getHistorial: async (dias: number = 30) => {
    const response = await api.get(`/api/banca/historial?dias=${dias}`);
    return response.data;
  },

  getEstadisticas: async (periodo: 'semana' | 'mes' | 'todo' = 'mes') => {
    const response = await api.get(`/api/banca/estadisticas?periodo=${periodo}`);
    return response.data;
  },
};

// ============================================================================
// MIS APUESTAS API (Nuevo v7)
// ============================================================================
export const misApuestasAPI = {
  getAll: async (estado?: string, limite: number = 50) => {
    let url = `/api/mis-apuestas?limite=${limite}`;
    if (estado) url += `&estado=${estado}`;
    const response = await api.get(url);
    return response.data;
  },

  crear: async (data: {
    apuesta_sistema_id?: number;
    tipster_id?: number;
    descripcion: string;
    cuota_usuario: number;
    stake: number;
    fecha_evento?: string;
    notas?: string;
  }) => {
    const response = await api.post('/api/mis-apuestas', data);
    return response.data;
  },

  marcarResultado: async (id: number, resultado: 'GANADA' | 'PERDIDA' | 'NULA') => {
    const response = await api.put(`/api/mis-apuestas/${id}/resultado`, { resultado });
    return response.data;
  },

  eliminar: async (id: number) => {
    const response = await api.delete(`/api/mis-apuestas/${id}`);
    return response.data;
  },
};

// ============================================================================
// PICKS RECOMENDADOS API (Nuevo v7)
// ============================================================================
export const picksAPI = {
  getRecomendados: async () => {
    const response = await api.get('/api/picks/recomendados');
    return response.data;
  },
};

// ============================================================================
// NOTIFICACIONES API (Nuevo v7)
// ============================================================================
export const notificacionesAPI = {
  getConfig: async () => {
    const response = await api.get('/api/notificaciones/config');
    return response.data;
  },

  updateConfig: async (data: {
    push_enabled?: boolean;
    email_enabled?: boolean;
    telegram_enabled?: boolean;
    alertas?: {
      pick_alto?: boolean;
      pick_medio?: boolean;
      racha_tipster?: boolean;
      resultado?: boolean;
      recordatorio?: boolean;
      drawdown?: boolean;
      meta?: boolean;
    };
    horario_inicio?: string;
    horario_fin?: string;
    silenciar_fines_semana?: boolean;
  }) => {
    const response = await api.put('/api/notificaciones/config', data);
    return response.data;
  },

  vincularTelegram: async () => {
    const response = await api.post('/api/notificaciones/vincular-telegram');
    return response.data;
  },

  desvincularTelegram: async () => {
    const response = await api.delete('/api/notificaciones/desvincular-telegram');
    return response.data;
  },
};

// ============================================================================
// LOGROS API (Nuevo v7)
// ============================================================================
export const logrosAPI = {
  getMisLogros: async () => {
    const response = await api.get('/api/logros/mis-logros');
    return response.data;
  },
};

// ============================================================================
// CONSEJO IA API
// ============================================================================
export const consejoIAAPI = {
  get: async (tipsterId: number) => {
    const response = await api.get(`/api/consejo-ia/${tipsterId}`);
    return response.data;
  },
};

// ============================================================================
// APUESTAS API
// ============================================================================
export const apuestasAPI = {
  getHoy: async () => {
    try {
      const response = await api.get('/api/apuestas/hoy');
      return response.data;
    } catch (error) {
      const dashboard = await dashboardAPI.getData();
      return dashboard.apuestas || { total: 0, apuestas: [] };
    }
  },
};

// ============================================================================
// RECOMENDACIONES API
// ============================================================================
export const recomendacionesAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/recomendaciones');
      return response.data;
    } catch (error) {
      return { seguir: [], evitar: [] };
    }
  },
};

export default api;
