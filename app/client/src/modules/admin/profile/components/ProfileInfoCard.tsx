'use client';

import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Shield,
    Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ProfileData } from '../types';

interface ProfileInfoCardProps {
    profile: ProfileData;
}

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
    const { t } = useTranslation();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role: string) => {
        const roleColors: Record<string, string> = {
            admin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200',
            manager: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200',
            waiter: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200',
            chef: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200',
            cashier: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200',
        };
        return roleColors[role.toLowerCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-semibold">
                            {getInitials(profile.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left space-y-1.5">
                        <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                        <p className="text-muted-foreground">{profile.email}</p>
                        <Badge
                            variant="outline"
                            className={`capitalize ${getRoleColor(profile.role)}`}
                        >
                            <Shield className="h-3 w-3 mr-1" />
                            {t(`staff.roles.${profile.role}`) || profile.role}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <Separator />

                {/* Account Information */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('profile.accountInfo')}
                    </h3>
                    <div className="grid gap-3">
                        <InfoRow
                            icon={<User className="h-4 w-4" />}
                            label={t('staff.username')}
                            value={profile.username}
                        />
                        <InfoRow
                            icon={<Mail className="h-4 w-4" />}
                            label={t('staff.email')}
                            value={profile.email}
                        />
                        <InfoRow
                            icon={<Phone className="h-4 w-4" />}
                            label={t('staff.phoneNumber')}
                            value={profile.phoneNumber}
                        />
                        <InfoRow
                            icon={<Clock className="h-4 w-4" />}
                            label={t('profile.lastLogin')}
                            value={formatDateTime(profile.lastLogin)}
                        />
                    </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {t('profile.personalInfo')}
                    </h3>
                    <div className="grid gap-3">
                        <InfoRow
                            icon={<User className="h-4 w-4" />}
                            label={t('staff.fullName')}
                            value={profile.fullName}
                        />
                        <InfoRow
                            icon={<MapPin className="h-4 w-4" />}
                            label={t('staff.address')}
                            value={profile.address || '-'}
                        />
                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label={t('staff.dateOfBirth')}
                            value={formatDate(profile.dateOfBirth)}
                        />
                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label={t('staff.hireDate')}
                            value={formatDate(profile.hireDate)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-medium min-w-[120px]">{label}:</span>
            <span className="text-muted-foreground">{value}</span>
        </div>
    );
}
