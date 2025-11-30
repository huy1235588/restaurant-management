/**
 * Image URL utility functions
 * 
 * These helpers build full URLs from relative image paths stored in the database.
 * The NEXT_PUBLIC_STORAGE_URL environment variable should point to the storage server.
 */

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || '';

/**
 * Build a full image URL from a relative path
 * 
 * @param imagePath - The relative path stored in database (e.g., "menu/image.jpg")
 * @returns Full URL to the image, or undefined if no path provided
 * 
 * @example
 * // With NEXT_PUBLIC_STORAGE_URL=http://localhost:5000
 * getImageUrl("menu/image.jpg") // returns "http://localhost:5000/menu/image.jpg"
 * getImageUrl(undefined) // returns undefined
 * getImageUrl("") // returns undefined
 */
export function getImageUrl(imagePath: string | null | undefined): string | undefined {
    if (!imagePath) {
        return undefined;
    }

    // If it's already a full URL (e.g., blob: for preview or http(s):// from external source)
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Build full URL from storage URL and path
    const baseUrl = STORAGE_URL.endsWith('/') ? STORAGE_URL.slice(0, -1) : STORAGE_URL;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${path}`;
}

/**
 * Check if a path is a valid image path
 * 
 * @param imagePath - The path to check
 * @returns true if the path is valid and non-empty
 */
export function hasImagePath(imagePath: string | null | undefined): imagePath is string {
    return typeof imagePath === 'string' && imagePath.length > 0;
}
