import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebouncedStorageOptions<T> {
    key: string;
    delay?: number;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
}

/**
 * Custom hook for debounced localStorage operations
 * Automatically saves to localStorage with debouncing to prevent excessive writes
 */
export function useDebouncedStorage<T>(
    initialValue: T,
    options: UseDebouncedStorageOptions<T>
) {
    const {
        key,
        delay = 1000,
        serialize = JSON.stringify,
        deserialize = JSON.parse,
    } = options;

    const [value, setValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? deserialize(item) : initialValue;
        } catch (error) {
            console.error(`Failed to load from localStorage (${key}):`, error);
            return initialValue;
        }
    });

    const [isDirty, setIsDirty] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Update value and mark as dirty
    const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
        setValue(newValue);
        setIsDirty(true);
    }, []);

    // Clear storage
    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setValue(initialValue);
            setIsDirty(false);
        } catch (error) {
            console.error(`Failed to clear localStorage (${key}):`, error);
        }
    }, [key, initialValue]);

    // Force save to storage immediately
    const forceSave = useCallback(() => {
        try {
            localStorage.setItem(key, serialize(value));
            setIsDirty(false);
        } catch (error) {
            console.error(`Failed to save to localStorage (${key}):`, error);
        }
    }, [key, value, serialize]);

    // Debounced save effect
    useEffect(() => {
        if (!isDirty) return;

        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, serialize(value));
                setIsDirty(false);
            } catch (error) {
                console.error(`Failed to save to localStorage (${key}):`, error);
            }
            timerRef.current = null;
        }, delay);

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, isDirty, key, delay, serialize]);

    return {
        value,
        setValue: updateValue,
        isDirty,
        clearStorage,
        forceSave,
    };
}
