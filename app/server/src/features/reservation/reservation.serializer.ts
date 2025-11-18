import { format } from 'date-fns';

/**
 * Serializer for Reservation objects
 * Converts Date objects to proper string formats for API responses
 */
export class ReservationSerializer {
    /**
     * Serialize a single reservation
     */
    static serialize(reservation: any): any {
        if (!reservation) return null;

        return {
            ...reservation,
            // Format reservationDate as YYYY-MM-DD
            reservationDate: format(new Date(reservation.reservationDate), 'yyyy-MM-dd'),
            // Format reservationTime as HH:mm:ss
            reservationTime: ReservationSerializer.formatTime(reservation.reservationTime),
            // Keep other date fields as ISO strings
            createdAt: reservation.createdAt?.toISOString(),
            updatedAt: reservation.updatedAt?.toISOString(),
            confirmedAt: reservation.confirmedAt?.toISOString(),
            seatedAt: reservation.seatedAt?.toISOString(),
            completedAt: reservation.completedAt?.toISOString(),
            cancelledAt: reservation.cancelledAt?.toISOString(),
            // Serialize nested relations
            table: reservation.table ? ReservationSerializer.serializeTable(reservation.table) : undefined,
            customer: reservation.customer ? ReservationSerializer.serializeCustomer(reservation.customer) : undefined,
            orders: reservation.orders ? reservation.orders.map((o: any) => ReservationSerializer.serializeOrder(o)) : undefined,
            audits: reservation.audits ? reservation.audits.map((a: any) => ReservationSerializer.serializeAudit(a)) : undefined,
        };
    }

    /**
     * Serialize an array of reservations
     */
    static serializeMany(reservations: any[]): any[] {
        return reservations.map((r) => ReservationSerializer.serialize(r));
    }

    /**
     * Serialize paginated reservation data
     */
    static serializePaginated(paginatedData: { 
        items: any[]; 
        pagination: { page: number; limit: number; total: number; totalPages: number } 
    }): any {
        return {
            items: ReservationSerializer.serializeMany(paginatedData.items),
            pagination: paginatedData.pagination,
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

    private static serializeTable(table: any): any {
        if (!table) return null;
        return {
            ...table,
            createdAt: table.createdAt?.toISOString(),
            updatedAt: table.updatedAt?.toISOString(),
        };
    }

    private static serializeCustomer(customer: any): any {
        if (!customer) return null;
        return {
            ...customer,
            birthday: customer.birthday ? format(new Date(customer.birthday), 'yyyy-MM-dd') : null,
            createdAt: customer.createdAt?.toISOString(),
            updatedAt: customer.updatedAt?.toISOString(),
        };
    }

    private static serializeOrder(order: any): any {
        if (!order) return null;
        return {
            ...order,
            orderTime: order.orderTime?.toISOString(),
            confirmedAt: order.confirmedAt?.toISOString(),
            completedAt: order.completedAt?.toISOString(),
            createdAt: order.createdAt?.toISOString(),
            updatedAt: order.updatedAt?.toISOString(),
        };
    }

    private static serializeAudit(audit: any): any {
        if (!audit) return null;
        return {
            ...audit,
            createdAt: audit.createdAt?.toISOString(),
        };
    }
}
