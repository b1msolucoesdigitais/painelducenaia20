import React, { useEffect } from 'react';
import { useAuthStore } from '../store';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      if (token && isAuthenticated) {
        try {
          const response = await authService.verifyToken();
          setUser(response.user);
        } catch (error) {
          console.error('Token inválido:', error);
          logout();
          toast.error('Sessão expirada. Faça login novamente.');
        }
      }
    };

    verifyAuth();
  }, [token, isAuthenticated, setUser, logout]);

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo App.tsx
  }

  return <>{children}</>;
};

export default ProtectedRoute;
