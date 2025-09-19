import axios from 'axios';
import { Section, Webhook } from '../store';

import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Configurar axios com interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken.state?.token) {
          config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
        }
      } catch (error) {
        console.error('Erro ao parsear token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Serviços de seções
export const sectionsService = {
  getSections: async (): Promise<Section[]> => {
    const response = await api.get('/sections');
    return response.data;
  },

  createSection: async (title: string, content: string): Promise<Section> => {
    const response = await api.post('/sections', { title, content });
    return response.data;
  },

  updateSection: async (id: number, title: string, content: string): Promise<Section> => {
    const response = await api.put(`/sections/${id}`, { title, content });
    return response.data;
  },

  deleteSection: async (id: number): Promise<void> => {
    await api.delete(`/sections/${id}`);
  },

  reorderSections: async (sections: { id: number; order: number }[]): Promise<void> => {
    await api.put('/sections/reorder', { sections });
  },
};

// Serviços de configuração
export const configService = {
  saveConfiguration: async () => {
    const response = await api.post('/config/save');
    return response.data;
  },

  updateProducts: async () => {
    const response = await api.post('/config/update-products');
    return response.data;
  },
};

// Serviços de usuários
export const usersService = {
  updateProfile: async (data: { email?: string; currentPassword?: string; newPassword?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  createUser: async (email: string, password: string) => {
    const response = await api.post('/users', { email, password });
    return response.data;
  },

  getUsers: async (): Promise<any[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};

// Serviços de webhooks
export const webhooksService = {
  getWebhooks: async (): Promise<Webhook[]> => {
    const response = await api.get('/webhooks');
    return response.data;
  },

  saveWebhook: async (type: 'save' | 'update', url: string): Promise<Webhook> => {
    const response = await api.post('/webhooks', { type, url });
    return response.data;
  },

  deleteWebhook: async (id: number): Promise<void> => {
    await api.delete(`/webhooks/${id}`);
  },
};

export default api;
