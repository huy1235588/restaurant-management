'use client';

import { useParams } from 'next/navigation';
import { OrderDetailView } from '@/modules/admin/order';

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
        return (
            <div className="text-center py-12 text-destructive">
                ID đơn hàng không hợp lệ
            </div>
        );
    }

    return <OrderDetailView orderId={orderId} />;
}
