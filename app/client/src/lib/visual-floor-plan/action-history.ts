/**
 * Action History for Undo/Redo functionality
 */

interface Action {
    id: string;
    type: 'move' | 'resize' | 'rotate' | 'style-change' | 'delete' | 'add' | 'template';
    timestamp: number;
    data: Record<string, any>;
}

export class ActionHistory {
    private actions: Action[] = [];
    private pointer: number = -1;
    private readonly maxSize = 50;

    /**
     * Add an action to history
     */
    addAction(action: Omit<Action, 'id' | 'timestamp'>): void {
        // Remove any actions after current index (when user does new action after undo)
        if (this.pointer < this.actions.length - 1) {
            this.actions = this.actions.slice(0, this.pointer + 1);
        }

        // Create action with id and timestamp
        const newAction: Action = {
            ...action,
            id: `action-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
        };

        this.actions.push(newAction);
        this.pointer = this.actions.length - 1;

        // Limit history size
        if (this.actions.length > this.maxSize) {
            this.actions = this.actions.slice(-this.maxSize);
            this.pointer = this.actions.length - 1;
        }
    }

    /**
     * Undo last action
     */
    undo(): Action | null {
        if (this.pointer < 0) return null;
        const action = this.actions[this.pointer];
        this.pointer--;
        return action;
    }

    /**
     * Redo last undone action
     */
    redo(): Action | null {
        if (this.pointer >= this.actions.length - 1) return null;
        this.pointer++;
        return this.actions[this.pointer];
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.pointer >= 0;
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.pointer < this.actions.length - 1;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.actions = [];
        this.pointer = -1;
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
        return this.pointer >= 0 ? this.actions[this.pointer] : null;
    }
}
