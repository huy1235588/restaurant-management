import { CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Activity {
    id: string | number;
    title: string;
    time: string;
    amount?: number;
    type?: 'completed' | 'pending' | 'new';
}

interface ActivityFeedProps {
    activities: Activity[];
    title?: string;
    description?: string;
}

export function ActivityFeed({ activities, title, description }: ActivityFeedProps) {
    const getIcon = (type?: string) => {
        switch (type) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-orange-600" />;
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || 'Recent Activity'}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center">
                            <div className="ml-4 space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                {activity.amount ? `$${activity.amount.toFixed(2)}` : getIcon(activity.type)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
