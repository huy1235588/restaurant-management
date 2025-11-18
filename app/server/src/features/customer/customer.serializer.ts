import { format } from 'date-fns';

/**
 * Serializer for Customer objects
 * Converts Date objects to proper string formats for API responses
 */
export class CustomerSerializer {
    /**
     * Serialize a single customer
     */
    static serialize(customer: any): any {
        if (!customer) return null;

        return {
            ...customer,
            // Format birthday as YYYY-MM-DD
            birthday: customer.birthday ? format(new Date(customer.birthday), 'yyyy-MM-dd') : null,
            // Keep other date fields as ISO strings
            createdAt: customer.createdAt?.toISOString(),
            updatedAt: customer.updatedAt?.toISOString(),
            // Serialize nested reservations if present
            reservations: customer.reservations 
                ? customer.reservations.map((r: any) => CustomerSerializer.serializeReservation(r)) 
                : undefined,
        };
    }

    /**
     * Serialize an array of customers
     */
    static serializeMany(customers: any[]): any[] {
        return customers.map((c) => CustomerSerializer.serialize(c));
    }

    /**
     * Serialize paginated customer data
     */
    static serializePaginated(paginatedData: { 
        items: any[]; 
        pagination: { page: number; limit: number; total: number; totalPages: number } 
    }): any {
        return {
            items: CustomerSerializer.serializeMany(paginatedData.items),
            pagination: paginatedData.pagination,
        };
    }

    /**
     * Serialize nested reservation (light version without full details)
     */
    private static serializeReservation(reservation: any): any {
        if (!reservation) return null;
        return {
            ...reservation,
            reservationDate: format(new Date(reservation.reservationDate), 'yyyy-MM-dd'),
            reservationTime: CustomerSerializer.formatTime(reservation.reservationTime),
            createdAt: reservation.createdAt?.toISOString(),
            updatedAt: reservation.updatedAt?.toISOString(),
            confirmedAt: reservation.confirmedAt?.toISOString(),
            seatedAt: reservation.seatedAt?.toISOString(),
            completedAt: reservation.completedAt?.toISOString(),
            cancelledAt: reservation.cancelledAt?.toISOString(),
        };
    }

    /**
     * Format time from Date object to HH:mm:ss string
     */
    private static formatTime(time: Date | string): string {
        if (!time) return '';
        
        // If it's already a string in HH:mm:ss format, return it
        if (typeof time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(time)) {
            return time;
        }

        // Convert to Date and format
        const date = new Date(time);
        return format(date, 'HH:mm:ss');
    }
}
