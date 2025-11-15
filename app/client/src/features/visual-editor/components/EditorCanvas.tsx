'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../stores';

interface EditorCanvasProps {
    width: number;
    height: number;
    children?: React.ReactNode;
}

export function EditorCanvas({ width, height, children }: EditorCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { zoom, pan, grid } = useEditorStore();
    const performanceRef = useRef({ frameCount: 0, lastTime: Date.now() });
    
    // Performance monitoring for canvas rendering
    const monitorPerformance = useCallback(() => {
        const now = Date.now();
        const perf = performanceRef.current;
        perf.frameCount++;
        
        // Log FPS every second
        if (now - perf.lastTime >= 1000) {
            const fps = perf.frameCount;
            if (process.env.NODE_ENV === 'development') {
                console.debug(`Canvas render FPS: ${fps}`);
            }
            perf.frameCount = 0;
            perf.lastTime = now;
        }
    }, []);
    
    // Draw grid on canvas
    const drawGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        monitorPerformance();
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!grid.enabled) return;
        
        // Set up grid style - check for dark mode
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDarkMode ? '#4b5563' : '#e0e0e0'; // gray-600 for dark mode
        ctx.lineWidth = 1;
        
        const gridSize = grid.size * zoom;
        const offsetX = pan.x % gridSize;
        const offsetY = pan.y % gridSize;
        
        // Draw vertical lines
        for (let x = offsetX; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = offsetY; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }, [width, height, zoom, pan, grid, monitorPerformance]);
    
    useEffect(() => {
        drawGrid();
    }, [drawGrid]);
    
    // Redraw grid on theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            drawGrid();
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        
        return () => observer.disconnect();
    }, [drawGrid]);
    
    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Canvas layer for grid */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="absolute inset-0 pointer-events-none"
            />
            
            {/* DOM layer for interactive elements */}
            <div
                className="absolute inset-0"
                style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: '0 0',
                }}
            >
                {children}
            </div>
        </div>
    );
}
