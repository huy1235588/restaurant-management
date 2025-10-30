import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null; // Only in memory, not persisted
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: User, accessToken: string) => void;
    setUser: (user: User) => void;
    setAccessToken: (token: string) => void;
    clearAuth: () => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null, // In memory only
            isAuthenticated: false,
            isLoading: true,

            setAuth: (user, accessToken) => {
                // DO NOT save tokens to localStorage - Security risk!
                // Access token kept in memory only
                // Refresh token is HttpOnly cookie, managed by browser
                
                set({
                    user,
                    accessToken, // Memory only
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            setUser: (user) => {
                set({ 
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            setAccessToken: (token) => {
                set({ accessToken: token });
            },

            clearAuth: () => {
                // Clear memory only
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            logout: () => {
                // Clear memory only
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            initializeAuth: () => {
                // Don't initialize from localStorage
                // Instead, verify session with server using cookie
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: true,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist user info, NOT tokens
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // accessToken is NOT persisted - stays in memory only
            }),
        }
    )
);
