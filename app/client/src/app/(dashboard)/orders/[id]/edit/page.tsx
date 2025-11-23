import { EditOrderView } from '@/modules/order';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: PageProps) {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
        return (
            <div className="text-center py-12 text-destructive">
                ID đơn hàng không hợp lệ
            </div>
        );
    }

    return <EditOrderView orderId={orderId} />;
}
