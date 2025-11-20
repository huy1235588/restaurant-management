// Format price in VND
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
}

// Format number with thousands separator
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Calculate margin percentage
export function calculateMargin(price?: number, cost?: number): number | null {
    if (!price || !cost || cost === 0) return null;
    return ((price - cost) / price) * 100;
}

// Format margin percentage
export function formatMargin(price?: number, cost?: number): string {
    const margin = calculateMargin(price, cost);
    if (margin === null) return 'N/A';
    return `${margin.toFixed(1)}%`;
}

// Format date
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

// Format date time
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get spicy level label
export function getSpicyLevelLabel(level?: number): string {
    if (level === undefined || level === null) return 'Not spicy';
    switch (level) {
        case 0:
            return 'Not spicy';
        case 1:
            return 'Mild';
        case 2:
            return 'Medium';
        case 3:
            return 'Hot';
        case 4:
            return 'Very hot';
        case 5:
            return 'Extremely hot';
        default:
            return 'Unknown';
    }
}

// Get spicy level emoji
export function getSpicyLevelEmoji(level?: number): string {
    if (level === undefined || level === null || level === 0) return '';
    return '🌶️'.repeat(level);
}

// Convert preparation time category to minutes
export function preparationTimeToMinutes(category: 'quick' | 'normal' | 'long'): {
    min: number;
    max: number;
} {
    switch (category) {
        case 'quick':
            return { min: 0, max: 15 };
        case 'normal':
            return { min: 16, max: 30 };
        case 'long':
            return { min: 31, max: 300 };
    }
}

// Format preparation time
export function formatPreparationTime(minutes?: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Generate item code suggestion from category
export function suggestItemCode(categoryName: string, existingCodes: string[] = []): string {
    // Get first 3 letters of category name in uppercase
    const prefix = categoryName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');

    // Find next available number
    let number = 1;
    let code = `${prefix}-${String(number).padStart(3, '0')}`;

    while (existingCodes.includes(code)) {
        number++;
        code = `${prefix}-${String(number).padStart(3, '0')}`;
    }

    return code;
}
