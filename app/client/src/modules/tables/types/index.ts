/**
 * Visual Editor Types
 * Type definitions for the floor plan editor
 */

export type Tool = 'select' | 'pan' | 'add' | 'delete';

export type TableShape = 'rectangle' | 'circle' | 'square' | 'oval';

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface TablePosition {
    tableId: number;
    tableNumber: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: TableShape;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
}

export interface LayoutData {
    version: string;
    floor: number;
    canvasSettings: {
        gridSize: number;
        zoom: number;
    };
    tables: TablePosition[];
}

export interface FloorPlanLayout {
    layoutId: number;
    floor: number;
    name: string;
    description?: string | null;
    data: LayoutData | Record<string, any>;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ViewState {
    zoom: number; // 0.25 to 2.0 (25% to 200%)
    pan: Position;
}

// Action types for undo/redo
export type Action =
    | MoveAction
    | ResizeAction
    | CreateAction
    | DeleteAction
    | BatchAction;

export interface BaseAction {
    type: string;
    timestamp: number;
}

export interface MoveAction extends BaseAction {
    type: 'move';
    tableId: number;
    oldPosition: Position;
    newPosition: Position;
}

export interface ResizeAction extends BaseAction {
    type: 'resize';
    tableId: number;
    oldSize: Size;
    newSize: Size;
}

export interface CreateAction extends BaseAction {
    type: 'create';
    table: TablePosition;
}

export interface DeleteAction extends BaseAction {
    type: 'delete';
    table: TablePosition;
}

export interface BatchAction extends BaseAction {
    type: 'batch';
    actions: Action[];
}

// Grid settings
export interface GridSettings {
    enabled: boolean;
    size: number; // 10, 20, 50
    snapEnabled: boolean;
}

// Template types
export interface FloorPlanTemplate {
    templateId: string;
    name: string;
    description: string;
    category: 'restaurant' | 'cafe' | 'fine-dining' | 'bar' | 'banquet';
    previewImage?: string;
    data: LayoutData;
}
