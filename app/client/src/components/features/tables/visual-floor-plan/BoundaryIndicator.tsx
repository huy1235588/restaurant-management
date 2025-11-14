'use client';

import { cn } from '@/lib/utils';

interface BoundaryIndicatorProps {
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  visible: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Visual indicator showing the working area boundaries
 * Helps users understand the canvas limits
 */
export function BoundaryIndicator({ 
  bounds, 
  visible, 
  zoom, 
  panX, 
  panY 
}: BoundaryIndicatorProps) {
  if (!visible) return null;

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  return (
    <div
      className="absolute pointer-events-none z-5"
      style={{
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}
    >
      {/* Boundary Rectangle */}
      <div
        className={cn(
          'absolute border-2 border-dashed rounded',
          'border-blue-400/50'
        )}
        style={{
          left: `${bounds.minX}px`,
          top: `${bounds.minY}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Label */}
        <div
          className={cn(
            'absolute -top-6 left-0',
            'px-2 py-1 rounded text-xs font-medium',
            'bg-blue-500/80 text-white backdrop-blur-sm'
          )}
          style={{
            transform: `scale(${1 / zoom})`,
            transformOrigin: 'left top',
          }}
        >
          Working Area
        </div>

        {/* Corner Markers */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
}
