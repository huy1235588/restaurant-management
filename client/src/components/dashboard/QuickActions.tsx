import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
}

interface QuickActionsProps {
    actions: QuickAction[];
    title?: string;
    description?: string;
}

export function QuickActions({ actions, title, description }: QuickActionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || 'Quick Actions'}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-2">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
