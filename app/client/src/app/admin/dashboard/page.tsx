'use client';

import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
                <p className="text-muted-foreground">{t('common.comingSoon')}</p>
            </div>
        </div>
    );
}
