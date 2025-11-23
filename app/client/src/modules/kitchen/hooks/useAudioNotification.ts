"use client";

import { useEffect, useRef, useState } from "react";
import { KITCHEN_CONFIG } from "../constants/kitchen.constants";

type SoundType = "newOrder" | "orderReady" | "urgent";

export function useAudioNotification() {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [volume, setVolume] = useState(KITCHEN_CONFIG.DEFAULT_SOUND_VOLUME);
    const audioRef = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

    // Load sound settings from localStorage
    useEffect(() => {
        const soundEnabled = localStorage.getItem(
            KITCHEN_CONFIG.SOUND_ENABLED_KEY
        );
        const soundVolume = localStorage.getItem(
            KITCHEN_CONFIG.SOUND_VOLUME_KEY
        );

        if (soundEnabled !== null) {
            setIsSoundEnabled(soundEnabled === "true");
        }

        if (soundVolume !== null) {
            setVolume(parseFloat(soundVolume));
        }

        // Preload audio files
        if (KITCHEN_CONFIG.AUDIO_ENABLED) {
            const newOrderAudio = new Audio(KITCHEN_CONFIG.SOUND_URLS.newOrder);
            const orderReadyAudio = new Audio(
                KITCHEN_CONFIG.SOUND_URLS.orderReady
            );
            const urgentAudio = new Audio(KITCHEN_CONFIG.SOUND_URLS.urgent);

            audioRef.current.set("newOrder", newOrderAudio);
            audioRef.current.set("orderReady", orderReadyAudio);
            audioRef.current.set("urgent", urgentAudio);
        }
    }, []);

    // Play sound function
    const playSound = (type: SoundType) => {
        if (!isSoundEnabled || !KITCHEN_CONFIG.AUDIO_ENABLED) {
            return;
        }

        const audio = audioRef.current.get(type);
        if (audio) {
            audio.volume = volume;
            audio.currentTime = 0; // Reset to start
            audio.play().catch((error) => {
                console.warn(`[Audio] Failed to play ${type} sound:`, error);
            });
        }
    };

    // Toggle sound on/off
    const toggleSound = () => {
        const newValue = !isSoundEnabled;
        setIsSoundEnabled(newValue);
        localStorage.setItem(
            KITCHEN_CONFIG.SOUND_ENABLED_KEY,
            newValue.toString()
        );
    };

    // Update volume
    const updateVolume = (newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);
        localStorage.setItem(
            KITCHEN_CONFIG.SOUND_VOLUME_KEY,
            clampedVolume.toString()
        );
    };

    return {
        isSoundEnabled,
        volume,
        playSound,
        toggleSound,
        updateVolume,
    };
}

// Browser Notification API
export function useBrowserNotification() {
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

    useEffect(() => {
        // Check if browser supports notifications
        if (!("Notification" in window)) {
            console.warn(
                "[Notification] Browser does not support notifications"
            );
            return;
        }

        // Check current permission
        setIsNotificationEnabled(Notification.permission === "granted");
    }, []);

    // Request notification permission
    const requestPermission = async () => {
        if (!("Notification" in window)) {
            return false;
        }

        const permission = await Notification.requestPermission();
        setIsNotificationEnabled(permission === "granted");
        return permission === "granted";
    };

    // Show notification
    const showNotification = (title: string, options?: NotificationOptions) => {
        if (!isNotificationEnabled || !KITCHEN_CONFIG.NOTIFICATION_ENABLED) {
            return;
        }

        try {
            new Notification(title, {
                icon: "/icons/kitchen-icon.png",
                badge: "/icons/kitchen-badge.png",
                ...options,
            });
        } catch (error) {
            console.warn("[Notification] Failed to show notification:", error);
        }
    };

    return {
        isNotificationEnabled,
        requestPermission,
        showNotification,
    };
}
