import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Action } from '../types';

interface HistoryState {
    history: Action[];
    currentIndex: number;
    maxHistory: number;
    
    // Actions
    push: (action: Action) => void;
    undo: () => Action | null;
    redo: () => Action | null;
    clear: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()(
    devtools(
        (set, get) => ({
            history: [],
            currentIndex: -1,
            maxHistory: MAX_HISTORY,
            
            push: (action: Action) => {
                set((state) => {
                    // Remove any redo history
                    const newHistory = state.history.slice(0, state.currentIndex + 1);
                    
                    // Add new action
                    newHistory.push(action);
                    
                    // Limit history size
                    if (newHistory.length > state.maxHistory) {
                        newHistory.shift();
                        return {
                            history: newHistory,
                            currentIndex: newHistory.length - 1,
                        };
                    }
                    
                    return {
                        history: newHistory,
                        currentIndex: newHistory.length - 1,
                    };
                });
            },
            
            undo: () => {
                const { history, currentIndex } = get();
                
                if (currentIndex < 0) {
                    return null;
                }
                
                const action = history[currentIndex];
                set({ currentIndex: currentIndex - 1 });
                return action;
            },
            
            redo: () => {
                const { history, currentIndex } = get();
                
                if (currentIndex >= history.length - 1) {
                    return null;
                }
                
                const action = history[currentIndex + 1];
                set({ currentIndex: currentIndex + 1 });
                return action;
            },
            
            clear: () => set({ history: [], currentIndex: -1 }),
            
            canUndo: () => {
                const { currentIndex } = get();
                return currentIndex >= 0;
            },
            
            canRedo: () => {
                const { history, currentIndex } = get();
                return currentIndex < history.length - 1;
            },
        }),
        { name: 'HistoryStore' }
    )
);
