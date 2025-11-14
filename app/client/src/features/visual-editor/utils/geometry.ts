import type { Rect, Position, Size, TablePosition } from '../types';

/**
 * Check if two rectangles collide (AABB collision detection)
 */
export function checkCollision(rect1: Rect, rect2: Rect): boolean {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Check if a table collides with any other tables
 */
export function checkTableCollision(
    table: TablePosition,
    allTables: TablePosition[],
    excludeIds: number[] = []
): boolean {
    const tableRect: Rect = {
        x: table.x,
        y: table.y,
        width: table.width,
        height: table.height,
    };
    
    return allTables.some((otherTable) => {
        if (otherTable.tableId === table.tableId || excludeIds.includes(otherTable.tableId)) {
            return false;
        }
        
        const otherRect: Rect = {
            x: otherTable.x,
            y: otherTable.y,
            width: otherTable.width,
            height: otherTable.height,
        };
        
        return checkCollision(tableRect, otherRect);
    });
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap position to grid
 */
export function snapPositionToGrid(position: Position, gridSize: number): Position {
    return {
        x: snapToGrid(position.x, gridSize),
        y: snapToGrid(position.y, gridSize),
    };
}

/**
 * Calculate bounding box for multiple tables
 */
export function calculateBoundingBox(tables: TablePosition[]): Rect | null {
    if (tables.length === 0) return null;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    tables.forEach((table) => {
        minX = Math.min(minX, table.x);
        minY = Math.min(minY, table.y);
        maxX = Math.max(maxX, table.x + table.width);
        maxY = Math.max(maxY, table.y + table.height);
    });
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Clamp size to valid range
 */
export function clampSize(size: Size): Size {
    return {
        width: clamp(size.width, 40, 200),
        height: clamp(size.height, 40, 200),
    };
}

/**
 * Calculate alignment guide positions
 */
export interface AlignmentGuide {
    type: 'vertical' | 'horizontal';
    position: number;
    snapTarget: number;
}

export function calculateAlignmentGuides(
    table: TablePosition,
    allTables: TablePosition[],
    threshold: number = 5
): AlignmentGuide[] {
    const guides: AlignmentGuide[] = [];
    
    const tableCenter = {
        x: table.x + table.width / 2,
        y: table.y + table.height / 2,
    };
    
    allTables.forEach((otherTable) => {
        if (otherTable.tableId === table.tableId) return;
        
        const otherCenter = {
            x: otherTable.x + otherTable.width / 2,
            y: otherTable.y + otherTable.height / 2,
        };
        
        // Vertical alignment (left, center, right)
        if (Math.abs(table.x - otherTable.x) < threshold) {
            guides.push({
                type: 'vertical',
                position: otherTable.x,
                snapTarget: otherTable.x,
            });
        }
        
        if (Math.abs(tableCenter.x - otherCenter.x) < threshold) {
            guides.push({
                type: 'vertical',
                position: otherCenter.x,
                snapTarget: otherCenter.x - table.width / 2,
            });
        }
        
        if (Math.abs(table.x + table.width - (otherTable.x + otherTable.width)) < threshold) {
            guides.push({
                type: 'vertical',
                position: otherTable.x + otherTable.width,
                snapTarget: otherTable.x + otherTable.width - table.width,
            });
        }
        
        // Horizontal alignment (top, center, bottom)
        if (Math.abs(table.y - otherTable.y) < threshold) {
            guides.push({
                type: 'horizontal',
                position: otherTable.y,
                snapTarget: otherTable.y,
            });
        }
        
        if (Math.abs(tableCenter.y - otherCenter.y) < threshold) {
            guides.push({
                type: 'horizontal',
                position: otherCenter.y,
                snapTarget: otherCenter.y - table.height / 2,
            });
        }
        
        if (Math.abs(table.y + table.height - (otherTable.y + otherTable.height)) < threshold) {
            guides.push({
                type: 'horizontal',
                position: otherTable.y + otherTable.height,
                snapTarget: otherTable.y + otherTable.height - table.height,
            });
        }
    });
    
    return guides;
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
    screenPos: Position,
    zoom: number,
    pan: Position
): Position {
    return {
        x: (screenPos.x - pan.x) / zoom,
        y: (screenPos.y - pan.y) / zoom,
    };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
    canvasPos: Position,
    zoom: number,
    pan: Position
): Position {
    return {
        x: canvasPos.x * zoom + pan.x,
        y: canvasPos.y * zoom + pan.y,
    };
}
