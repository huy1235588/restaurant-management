'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizeRotateHandlesProps {
    tableId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zoom: number;
    onResize: (tableId: number, width: number, height: number) => void;
    onRotate: (tableId: number, rotation: number) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w';

export function ResizeRotateHandles({
    tableId,
    x,
    y,
    width,
    height,
    rotation,
    zoom,
    onResize,
    onRotate,
}: ResizeRotateHandlesProps) {
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startSizeRef = useRef({ width: 0, height: 0 });
    const startRotationRef = useRef(0);
    const centerRef = useRef({ x: 0, y: 0 });

    // Minimum size constraints
    const MIN_WIDTH = 60;
    const MIN_HEIGHT = 60;

    const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
        e.stopPropagation();
        setIsResizing(true);
        setActiveHandle(handle);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startSizeRef.current = { width, height };
    }, [width, height]);

    const handleRotateStart = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRotating(true);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startRotationRef.current = rotation;
        
        // Calculate center point
        const rect = (e.target as HTMLElement).closest('.table-container')?.getBoundingClientRect();
        if (rect) {
            centerRef.current = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
        }
    }, [rotation]);

    useEffect(() => {
        if (!isResizing && !isRotating) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing && activeHandle) {
                const deltaX = (e.clientX - startPosRef.current.x) / zoom;
                const deltaY = (e.clientY - startPosRef.current.y) / zoom;

                let newWidth = startSizeRef.current.width;
                let newHeight = startSizeRef.current.height;

                // Calculate new dimensions based on handle
                switch (activeHandle) {
                    case 'e':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width + deltaX);
                        break;
                    case 'w':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width - deltaX);
                        break;
                    case 's':
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height + deltaY);
                        break;
                    case 'n':
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height - deltaY);
                        break;
                    case 'se':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width + deltaX);
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height + deltaY);
                        break;
                    case 'sw':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width - deltaX);
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height + deltaY);
                        break;
                    case 'ne':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width + deltaX);
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height - deltaY);
                        break;
                    case 'nw':
                        newWidth = Math.max(MIN_WIDTH, startSizeRef.current.width - deltaX);
                        newHeight = Math.max(MIN_HEIGHT, startSizeRef.current.height - deltaY);
                        break;
                }

                onResize(tableId, newWidth, newHeight);
            } else if (isRotating) {
                // Calculate angle from center
                const deltaX = e.clientX - centerRef.current.x;
                const deltaY = e.clientY - centerRef.current.y;
                let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                
                // Normalize to 0-360
                angle = (angle + 90 + 360) % 360;

                // Snap to 15° increments if Shift is pressed
                if (e.shiftKey) {
                    angle = Math.round(angle / 15) * 15;
                }

                onRotate(tableId, angle);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setIsRotating(false);
            setActiveHandle(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isRotating, activeHandle, tableId, zoom, onResize, onRotate]);

    const handleStyle = 'absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full hover:scale-125 transition-transform cursor-pointer shadow-md';

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Corner Handles */}
            <div
                className={cn(handleStyle, 'cursor-nw-resize pointer-events-auto')}
                style={{ top: -6, left: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div
                className={cn(handleStyle, 'cursor-ne-resize pointer-events-auto')}
                style={{ top: -6, right: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div
                className={cn(handleStyle, 'cursor-sw-resize pointer-events-auto')}
                style={{ bottom: -6, left: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div
                className={cn(handleStyle, 'cursor-se-resize pointer-events-auto')}
                style={{ bottom: -6, right: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'se')}
            />

            {/* Edge Handles */}
            <div
                className={cn(handleStyle, 'cursor-n-resize pointer-events-auto')}
                style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div
                className={cn(handleStyle, 'cursor-e-resize pointer-events-auto')}
                style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
            <div
                className={cn(handleStyle, 'cursor-s-resize pointer-events-auto')}
                style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
                className={cn(handleStyle, 'cursor-w-resize pointer-events-auto')}
                style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'w')}
            />

            {/* Rotation Handle */}
            <div
                className={cn(
                    'absolute w-6 h-6 bg-purple-500 border-2 border-white rounded-full pointer-events-auto',
                    'flex items-center justify-center cursor-grab hover:scale-110 transition-all shadow-md',
                    isRotating && 'cursor-grabbing scale-110'
                )}
                style={{ top: -30, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={handleRotateStart}
                title={`Rotation: ${Math.round(rotation)}°`}
            >
                <RotateCw className="w-3 h-3 text-white" />
            </div>

            {/* Rotation angle indicator */}
            {isRotating && (
                <div
                    className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
                >
                    {Math.round(rotation)}°
                </div>
            )}
        </div>
    );
}
