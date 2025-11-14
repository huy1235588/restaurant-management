/**
 * Utilities for calculating and constraining canvas pan boundaries
 */

interface TablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const BOUNDARY_PADDING = 100; // Extra padding around tables

/**
 * Calculate the bounding box containing all tables
 */
export function calculateCanvasBounds(
  tables: TablePosition[],
  canvasWidth: number,
  canvasHeight: number
): CanvasBounds {
  if (tables.length === 0) {
    // Default bounds when no tables exist
    return {
      minX: 0,
      maxX: canvasWidth,
      minY: 0,
      maxY: canvasHeight,
    };
  }

  // Find the extents of all tables
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  tables.forEach(table => {
    const tableLeft = table.x;
    const tableTop = table.y;
    const tableRight = table.x + table.width;
    const tableBottom = table.y + table.height;

    minX = Math.min(minX, tableLeft);
    minY = Math.min(minY, tableTop);
    maxX = Math.max(maxX, tableRight);
    maxY = Math.max(maxY, tableBottom);
  });

  // Add padding around the working area
  return {
    minX: minX - BOUNDARY_PADDING,
    maxX: maxX + BOUNDARY_PADDING,
    minY: minY - BOUNDARY_PADDING,
    maxY: maxY + BOUNDARY_PADDING,
  };
}

/**
 * Constrain pan offset to keep the working area visible
 */
export function constrainPanOffset(
  panX: number,
  panY: number,
  bounds: CanvasBounds,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): { x: number; y: number } {
  // Calculate the visible area dimensions
  const visibleWidth = canvasWidth / zoom;
  const visibleHeight = canvasHeight / zoom;

  // Calculate the working area dimensions
  const workingWidth = bounds.maxX - bounds.minX;
  const workingHeight = bounds.maxY - bounds.minY;

  // If working area is smaller than visible area, center it
  if (workingWidth < visibleWidth) {
    const centerX = (bounds.minX + bounds.maxX) / 2;
    panX = -(centerX - visibleWidth / 2);
  } else {
    // Constrain to keep working area visible
    const minPanX = -(bounds.maxX - visibleWidth);
    const maxPanX = -bounds.minX;
    panX = Math.max(minPanX, Math.min(maxPanX, panX));
  }

  if (workingHeight < visibleHeight) {
    const centerY = (bounds.minY + bounds.maxY) / 2;
    panY = -(centerY - visibleHeight / 2);
  } else {
    const minPanY = -(bounds.maxY - visibleHeight);
    const maxPanY = -bounds.minY;
    panY = Math.max(minPanY, Math.min(maxPanY, panY));
  }

  return { x: panX, y: panY };
}

/**
 * Calculate optimal pan offset and zoom to fit all tables in view
 */
export function calculateFitToViewOffset(
  tables: TablePosition[],
  canvasWidth: number,
  canvasHeight: number
): { panX: number; panY: number; zoom: number } {
  if (tables.length === 0) {
    return { panX: 0, panY: 0, zoom: 1 };
  }

  // Calculate bounding box of all tables
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  tables.forEach(table => {
    const tableLeft = table.x;
    const tableTop = table.y;
    const tableRight = table.x + table.width;
    const tableBottom = table.y + table.height;

    minX = Math.min(minX, tableLeft);
    minY = Math.min(minY, tableTop);
    maxX = Math.max(maxX, tableRight);
    maxY = Math.max(maxY, tableBottom);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Add 20% padding
  const padding = 0.2;
  const paddedWidth = contentWidth * (1 + padding);
  const paddedHeight = contentHeight * (1 + padding);

  // Calculate zoom to fit
  const zoomX = canvasWidth / paddedWidth;
  const zoomY = canvasHeight / paddedHeight;
  const zoom = Math.min(zoomX, zoomY, 3.0); // Cap at 3x zoom

  // Calculate center of content
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Calculate pan to center the content
  const panX = canvasWidth / (2 * zoom) - centerX;
  const panY = canvasHeight / (2 * zoom) - centerY;

  return { panX, panY, zoom };
}
