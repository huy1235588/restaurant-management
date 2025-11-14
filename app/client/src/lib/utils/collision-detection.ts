/**
 * Utilities for collision detection and grid snapping
 */

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check if two axis-aligned bounding boxes (AABB) overlap
 */
export function rectanglesOverlap(rect1: Rectangle, rect2: Rectangle): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Detect if a table placement would collide with existing tables
 * @param position The position to check (top-left corner)
 * @param size The size of the table to place
 * @param existingTables Array of existing table positions
 * @param buffer Optional buffer space around tables (default: 10px)
 * @returns true if collision detected, false otherwise
 */
export function detectCollision(
  position: { x: number; y: number },
  size: { width: number; height: number },
  existingTables: Rectangle[],
  buffer: number = 10
): boolean {
  const newTableRect: Rectangle = {
    x: position.x - buffer,
    y: position.y - buffer,
    width: size.width + buffer * 2,
    height: size.height + buffer * 2,
  };

  return existingTables.some(table => {
    const tableRect: Rectangle = {
      x: table.x - buffer,
      y: table.y - buffer,
      width: table.width + buffer * 2,
      height: table.height + buffer * 2,
    };
    return rectanglesOverlap(newTableRect, tableRect);
  });
}

/**
 * Snap a value to the nearest grid position
 * @param value The value to snap
 * @param gridSize The size of each grid cell
 * @returns The snapped value
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Generate the next available table number
 * @param existingNumbers Array of existing table numbers
 * @returns The next table number
 */
export function generateNextTableNumber(existingNumbers: number[]): number {
  if (existingNumbers.length === 0) return 1;
  
  const maxNumber = Math.max(...existingNumbers);
  
  // Find first gap in sequence
  for (let i = 1; i <= maxNumber; i++) {
    if (!existingNumbers.includes(i)) {
      return i;
    }
  }
  
  // No gaps, return next number
  return maxNumber + 1;
}

/**
 * Check if a table position is within canvas bounds
 * @param position The position to check (top-left corner)
 * @param size The size of the table
 * @param canvasWidth The width of the canvas
 * @param canvasHeight The height of the canvas
 * @param margin Optional margin from edges (default: 20px)
 * @returns true if within bounds, false otherwise
 */
export function isWithinCanvasBounds(
  position: { x: number; y: number },
  size: { width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
  margin: number = 20
): boolean {
  const tableRight = position.x + size.width;
  const tableBottom = position.y + size.height;
  
  return (
    position.x >= margin &&
    position.y >= margin &&
    tableRight <= canvasWidth - margin &&
    tableBottom <= canvasHeight - margin
  );
}
