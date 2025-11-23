'use client';

import { ReservationListView } from '@/modules/reservations/views';

export default function ReservationsPage() {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <ReservationListView />
        </div>
    );
}
