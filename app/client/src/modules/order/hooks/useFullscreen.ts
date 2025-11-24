import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseFullscreenOptions {
    showToast?: boolean;
    toastDuration?: number;
}

/**
 * Custom hook for fullscreen functionality with keyboard shortcuts
 */
export function useFullscreen(options: UseFullscreenOptions = {}) {
    const { showToast = true, toastDuration = 3000 } = options;
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle fullscreen mode
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
            if (showToast) {
                toast.info("Fullscreen Mode", {
                    description: "Press F11 or ESC to exit fullscreen",
                    duration: toastDuration,
                });
            }
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, [showToast, toastDuration]);

    // Enter fullscreen
    const enterFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, []);

    // Listen to fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcut for fullscreen (F11)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F11") {
                e.preventDefault();
                toggleFullscreen();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [toggleFullscreen]);

    return {
        isFullscreen,
        toggleFullscreen,
        enterFullscreen,
        exitFullscreen,
    };
}
