import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-600 dark:text-red-400">
            <AlertCircle className="h-16 w-16 mb-4" />
            <p className="text-xl font-semibold mb-2">
                {message || t('kitchen.failedToLoad')}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-4">
                    {t('common.tryAgain')}
                </Button>
            )}
        </div>
    );
}
