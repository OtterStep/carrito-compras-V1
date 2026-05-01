import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await authService.login(email, password);
          console.log('Login exitoso, recibiendo tokens:', res);
          set({ 
            user: res.user, 
            accessToken: res.accessToken || res.token, // Soportar ambos nombres por si acaso
            refreshToken: res.refreshToken, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Error en el store al login:', error);
          throw error;
        }
      },
      logout: () => {
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          authService.logout(refreshToken).catch(console.error);
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        // Limpiar localStorage explícitamente si es necesario
        localStorage.removeItem('auth-storage');
      },
      refresh: async () => {
        const newTokens = await authService.refreshToken(get().refreshToken!);
        set({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
      },
    }),
    { name: 'auth-storage' }
  )
);
