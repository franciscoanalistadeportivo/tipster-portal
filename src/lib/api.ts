/**
 * API Client - Conexión segura al backend
 * Versión con seguridad mejorada
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

let accessToken: string | null = null;
let refreshToken: string | null = null;

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
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
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
        accessToken = response.data.access_token;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
  if (typeof window !== 'undefined') sessionStorage.setItem('refresh_token', refresh);
};

export const loadTokens = () => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('refresh_token');
    if (stored) refreshToken = stored;
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') sessionStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => !!accessToken || !!refreshToken;

// ============================================================================
// AUTH API (Protegido)
// ============================================================================
export const authAPI = {
  register: async (email: string, password: string, nombre: string) => {
    const response = await api.post('/api/auth/register', { email, password, nombre });
    if (response.data.access_token) setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },
  logout: () => clearTokens(),
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============================================================================
// DASHBOARD API (Público - Solo lectura de datos generales)
// ============================================================================
export const dashboardAPI = {
  getData: async () => {
    const response = await publicApi.get('/api/public/dashboard');
    return response.data;
  },
};

// ============================================================================
// TIPSTERS API (Protegido)
// ============================================================================
export const tipstersAPI = {
  getAll: async () => {
    // Intenta con autenticación, fallback a público
    try {
      const response = await api.get('/api/tipsters');
      return response.data;
    } catch (error) {
      // Fallback: usa datos del dashboard público
      const dashboard = await dashboardAPI.getData();
      return { tipsters: [], total: dashboard.tipsters?.total || 0 };
    }
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/tipsters/${id}`);
    return response.data;
  },
};

// ============================================================================
// BANCA API (Protegido)
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
// CONSEJO IA API (Protegido)
// ============================================================================
export const consejoIAAPI = {
  get: async (tipsterId: number) => {
    const response = await api.get(`/api/consejo-ia/${tipsterId}`);
    return response.data;
  },
};

// ============================================================================
// APUESTAS API (Mixto)
// ============================================================================
export const apuestasAPI = {
  getHoy: async () => {
    // Intenta con autenticación, fallback a público
    try {
      const response = await api.get('/api/apuestas/hoy');
      return response.data;
    } catch (error) {
      // Fallback: usa datos del dashboard público
      const dashboard = await dashboardAPI.getData();
      return dashboard.apuestas || { total: 0, apuestas: [] };
    }
  },
};

// ============================================================================
// RECOMENDACIONES API (Protegido)
// ============================================================================
export const recomendacionesAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/recomendaciones');
      return response.data;
    } catch (error) {
      // Fallback vacío
      return { seguir: [], evitar: [] };
    }
  },
};

export default api;
