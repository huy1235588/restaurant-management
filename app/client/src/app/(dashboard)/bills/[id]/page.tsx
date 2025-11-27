import { BillDetailView } from '@/modules/bills';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BillDetailPage({ params }: PageProps) {
    const { id } = await params;
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
