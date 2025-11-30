import { format, parseISO } from 'date-fns';

// Format date for display
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    try {
        return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
        return '-';
    }
}

// Format date for input
export function formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch {
        return '';
    }
}

// Format salary for display (VND)
export function formatSalary(salary: number | null | undefined): string {
    if (salary === null || salary === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(salary);
}

// Format phone number
export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '-';
    // Simple format: add spaces
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

export * from './validation';
