/**
 * Action History for Undo/Redo functionality
 */

interface Action {
    id: string;
    type: 'move' | 'resize' | 'rotate' | 'style-change' | 'delete' | 'add';
    timestamp: number;
    data: Record<string, any>;
}

export class ActionHistory {
    private actions: Action[] = [];
    private currentIndex: number = -1;
    private readonly maxSize = 50;

    /**
     * Add an action to history
     */
    addAction(action: Omit<Action, 'id' | 'timestamp'>): void {
        // Remove any actions after current index (when user does new action after undo)
        if (this.currentIndex < this.actions.length - 1) {
            this.actions = this.actions.slice(0, this.currentIndex + 1);
        }

        // Create action with id and timestamp
        const newAction: Action = {
            ...action,
            id: `action-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
        };

        this.actions.push(newAction);
        this.currentIndex = this.actions.length - 1;

        // Limit history size
        if (this.actions.length > this.maxSize) {
            this.actions = this.actions.slice(-this.maxSize);
            this.currentIndex = this.actions.length - 1;
        }
    }

    /**
     * Undo last action
     */
    undo(): Action | null {
        if (this.currentIndex <= 0) return null;
        this.currentIndex--;
        return this.actions[this.currentIndex];
    }

    /**
     * Redo last undone action
     */
    redo(): Action | null {
        if (this.currentIndex >= this.actions.length - 1) return null;
        this.currentIndex++;
        return this.actions[this.currentIndex];
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.currentIndex < this.actions.length - 1;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.actions = [];
        this.currentIndex = -1;
    }

    /**
     * Get all actions
     */
    getActions(): Action[] {
        return [...this.actions];
    }

    /**
     * Get current action
     */
    getCurrentAction(): Action | null {
        return this.currentIndex >= 0 ? this.actions[this.currentIndex] : null;
    }
}
