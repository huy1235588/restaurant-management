import { OrderDetailsView } from '@/modules/orders';

interface OrderDetailsPageProps {
    params: {
        id: string;
    };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
    return <OrderDetailsView orderId={Number(params.id)} />;
}
