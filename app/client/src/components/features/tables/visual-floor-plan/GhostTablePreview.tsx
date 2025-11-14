'use client';

import { cn } from '@/lib/utils';

interface GhostTablePreviewProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isValid: boolean; // false if collision detected
  shape?: 'rectangle' | 'circle' | 'square' | 'oval';
}

/**
 * Ghost table preview shown when placing a new table
 */
export function GhostTablePreview({ 
  position, 
  size, 
  isValid,
  shape = 'rectangle' 
}: GhostTablePreviewProps) {
  const borderRadius = shape === 'circle' || shape === 'oval' ? '50%' : shape === 'square' ? '0.5rem' : '0.25rem';

  return (
    <div
      className={cn(
        'absolute border-2 border-dashed transition-all pointer-events-none z-50',
        'flex items-center justify-center',
        isValid 
          ? 'border-blue-500 bg-blue-500/20' 
          : 'border-red-500 bg-red-500/20'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: 'translate(-50%, -50%)', // Center on cursor
        borderRadius,
      }}
    >
      <div className="text-center">
        <div className={cn(
          'text-xs font-semibold px-2 py-1 rounded',
          isValid 
            ? 'text-blue-700 bg-blue-100/80' 
            : 'text-red-700 bg-red-100/80'
        )}>
          {isValid ? 'Click to place' : 'Collision!'}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {size.width}×{size.height}
        </div>
      </div>
    </div>
  );
}
