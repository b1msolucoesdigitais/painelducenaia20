// Configuração da API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 10000,
};

// Configuração de toast
export const TOAST_CONFIG = {
  position: 'top-right' as const,
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10B981',
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#EF4444',
      secondary: '#fff',
    },
  },
};
