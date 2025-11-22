'use client';

import { KitchenQueueView } from '@/modules/orders';

export default function KitchenPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Hàng Đợi Bếp</h1>
                <p className="text-muted-foreground mt-1">
                    Theo dõi và xử lý các món ăn đang chờ chế biến
                </p>
            </div>

            {/* Kitchen Queue View */}
            <KitchenQueueView />
        </div>
    );
}
