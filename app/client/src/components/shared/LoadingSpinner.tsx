import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    message?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function LoadingSpinner({ 
    size = 'md', 
    className,
    message 
}: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
            {message && (
                <p className="mt-4 text-muted-foreground">{message}</p>
            )}
        </div>
    );
}
