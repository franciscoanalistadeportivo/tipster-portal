/**
 * API Client - Conexión segura al backend
 * SEGURIDAD:
 * - Tokens almacenados en memoria (no localStorage para evitar XSS)
 * - Refresh automático de tokens
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

// Almacenamiento en memoria (más seguro que localStorage)
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token a requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
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

// Funciones de gestión de tokens
export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('refresh_token', refresh);
  }
};

export const loadTokens = () => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('refresh_token');
    if (stored) {
      refreshToken = stored;
    }
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refresh_token');
  }
};

export const isAuthenticated = () => {
  return !!accessToken || !!refreshToken;
};

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  register: async (email: string, password: string, nombre: string) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      nombre,
    });
    if (response.data.access_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    if (response.data.access_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }
    return response.data;
  },

  logout: () => {
    clearTokens();
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============================================================================
// TIPSTERS API
// ============================================================================
export const tipstersAPI = {
  getAll: async () => {
    const response = await api.get('/api/tipsters');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/tipsters/${id}`);
    return response.data;
  },
};

// ============================================================================
// BANCA API (NUEVO)
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
// APUESTAS API
// ============================================================================
export const apuestasAPI = {
  getHoy: async () => {
    const response = await api.get('/api/apuestas/hoy');
    return response.data;
  },
};

// ============================================================================
// RECOMENDACIONES API
// ============================================================================
export const recomendacionesAPI = {
  get: async () => {
    const response = await api.get('/api/recomendaciones');
    return response.data;
  },
};

export default api;
