import reservationRepository from '@/features/reservation/reservation.repository';
import tableRepository from '@/features/table/table.repository';
import { RESERVATION_DEFAULTS, ReservationDateUtils } from '@/features/reservation/utils/reservation-settings';
import { RestaurantTable, Reservation } from '@prisma/client';
import { NotFoundError } from '@/shared/utils/errors';

export interface AvailabilityQuery {
    reservationDate: Date;
    reservationTime: string | Date;
    duration: number;
    tableId: number;
    excludeReservationId?: number;
}

export interface AvailabilityResult {
    available: boolean;
    conflicts: Reservation[];
}

export interface TableSearchQuery {
    reservationDate: Date;
    reservationTime: string | Date;
    duration: number;
    partySize: number;
    floor?: number;
    excludeReservationId?: number;
}

export interface AutoAssignQuery extends TableSearchQuery {
    preferredTableId?: number;
}

class ReservationAvailabilityService {
    private buildTimeRange(reservationDate: Date, reservationTime: string | Date, duration: number) {
        const start = ReservationDateUtils.combineDateAndTime(reservationDate, reservationTime);
        const end = ReservationDateUtils.addMinutes(start, duration);
        return { start, end };
    }

    private hasConflict(existing: Reservation, windowStart: Date, windowEnd: Date): boolean {
        const existingStart = ReservationDateUtils.combineDateAndTime(existing.reservationDate, existing.reservationTime);
        const existingEnd = ReservationDateUtils.addMinutes(existingStart, existing.duration);
        return ReservationDateUtils.overlaps(
            existingStart,
            existingEnd,
            windowStart,
            windowEnd,
            RESERVATION_DEFAULTS.bufferMinutes,
        );
    }

    async checkTableAvailability(params: AvailabilityQuery): Promise<AvailabilityResult> {
        const tableDetails = await tableRepository.findById(params.tableId);
        if (!tableDetails) {
            throw new NotFoundError('Table not found');
        }

        const activeOrders = tableDetails.orders?.filter((order) => !['served', 'cancelled'].includes(order.status));
        if (activeOrders?.length) {
            return { available: false, conflicts: [] };
        }

        const { start, end } = this.buildTimeRange(params.reservationDate, params.reservationTime, params.duration);
        const reservations = await reservationRepository.findActiveByDate(params.reservationDate, {
            tableIds: [params.tableId],
            excludeReservationId: params.excludeReservationId,
        });

        const conflicts = reservations.filter((existing) => this.hasConflict(existing, start, end));

        if (conflicts.length) {
            return { available: false, conflicts };
        }

        return { available: true, conflicts: [] };
    }

    async getAvailableTables(query: TableSearchQuery): Promise<RestaurantTable[]> {
        const candidates = await tableRepository.findAvailable({
            capacity: query.partySize,
            floor: query.floor,
        });

        const availabilityChecks = await Promise.all(
            candidates.map(async (table) => {
                const result = await this.checkTableAvailability({
                    tableId: table.tableId,
                    reservationDate: query.reservationDate,
                    reservationTime: query.reservationTime,
                    duration: query.duration,
                    excludeReservationId: query.excludeReservationId,
                });
                return { table, available: result.available };
            }),
        );

        return availabilityChecks.filter((item) => item.available).map((item) => item.table);
    }

    async autoAssignTable(query: AutoAssignQuery): Promise<RestaurantTable | null> {
        const tables = await this.getAvailableTables(query);
        if (!tables.length) {
            return null;
        }

        const scored = tables
            .map((table) => ({ table, score: this.scoreTable(table, query) }))
            .sort((a, b) => b.score - a.score);

        return scored[0]?.table ?? null;
    }

    private scoreTable(table: RestaurantTable, query: AutoAssignQuery): number {
        let score = 0;

        if (query.preferredTableId && table.tableId === query.preferredTableId) {
            score += 30;
        }

        if (table.capacity === query.partySize) {
            score += 20;
        } else {
            const difference = Math.abs(table.capacity - query.partySize);
            score += Math.max(0, 15 - difference * 2);
        }

        if (query.floor && table.floor === query.floor) {
            score += 5;
        }

        if (table.section && query.partySize >= table.minCapacity) {
            score += 2;
        }

        return score;
    }
}

export const reservationAvailabilityService = new ReservationAvailabilityService();
