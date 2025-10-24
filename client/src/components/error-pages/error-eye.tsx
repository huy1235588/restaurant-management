"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorEyeProps {
    size?: "sm" | "md" | "lg";
}

export function ErrorEye({ size = "md" }: ErrorEyeProps) {
    const pupilRef = useRef<HTMLDivElement | null>(null);
    const [isBlinking, setIsBlinking] = useState(false);

    const sizeClasses = {
        sm: "w-[70px] h-[70px]",
        md: "w-[90px] h-[90px] md:w-[110px] md:h-[110px]",
        lg: "w-[120px] h-[120px] md:w-[140px] md:h-[140px]",
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const eye = pupilRef.current?.parentElement;
        if (!eye || !pupilRef.current) return;

        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxOffset = rect.width / 6;

        const pupilX = Math.cos(angle) * maxOffset;
        const pupilY = Math.sin(angle) * maxOffset;

        pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, Math.random() * 2000 + 4000);

        return () => clearInterval(blinkInterval);
    }, []);

    return (
        <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]}`}>
            <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
                <div
                    ref={pupilRef}
                    className="rounded-full transition-transform duration-75 ease-linear bg-black"
                    style={{ width: 30, height: 30 }}
                />
            </div>

            <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: "0 0 20px 6px rgba(0,142,236,0.06)" }}
            />

            <AnimatePresence>
                {isBlinking && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-[#242424] origin-top rounded-full"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
