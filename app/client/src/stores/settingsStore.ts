import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    language: 'vi' | 'en';
    theme: 'light' | 'dark' | 'system';

    // Actions
    setLanguage: (language: 'vi' | 'en') => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'vi',
            theme: 'system',

            setLanguage: (language) => set({ language }),

            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'settings-storage',
        }
    )
);
