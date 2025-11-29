'use client';

import { useParams } from 'next/navigation';
import { BillDetailView } from '@/modules/bills';

export default function BillDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const billId = parseInt(id, 10);

    if (isNaN(billId)) {
        return (
            <div className="text-center py-12 text-destructive">
                ID hóa đơn không hợp lệ
            </div>
        );
    }

    return <BillDetailView billId={billId} />;
}
