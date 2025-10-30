import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                {Icon && (
                    <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                )}
                <p className="text-xl font-medium">{title}</p>
                {description && (
                    <p className="text-muted-foreground mt-2">{description}</p>
                )}
                {action && (
                    <Button onClick={action.onClick} className="mt-4">
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
