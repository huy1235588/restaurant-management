'use client';

import { useParams } from 'next/navigation';
import { ReservationDetailView } from '@/modules/admin/reservations/views';

export default function ReservationDetailPage() {
    const params = useParams();
    const reservationId = parseInt(params.id as string, 10);

    if (isNaN(reservationId)) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Invalid reservation ID</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <ReservationDetailView reservationId={reservationId} />
        </div>
    );
}
