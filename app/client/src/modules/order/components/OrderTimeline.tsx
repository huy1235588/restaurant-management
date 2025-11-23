import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, getRelativeTime } from '../utils';
import { Circle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    id: string;
    type: 'created' | 'confirmed' | 'ready' | 'serving' | 'completed' | 'cancelled' | 'updated';
    title: string;
    description?: string;
    timestamp: string;
    user?: string;
}

interface OrderTimelineProps {
    events: TimelineEvent[];
}

function getEventIcon(type: TimelineEvent['type']) {
    switch (type) {
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'cancelled':
            return <XCircle className="h-4 w-4 text-red-600" />;
        case 'confirmed':
        case 'ready':
        case 'serving':
            return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
        default:
            return <Circle className="h-4 w-4 text-gray-400" />;
    }
}

export function OrderTimeline({ events }: OrderTimelineProps) {
    if (events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có sự kiện nào
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="rounded-full bg-background border p-1">
                                    {getEventIcon(event.type)}
                                </div>
                                {index < events.length - 1 && (
                                    <div className="w-px flex-1 bg-border mt-2" />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-medium">{event.title}</h4>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.user && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Bởi {event.user}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">
                                            {getRelativeTime(event.timestamp)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(event.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
