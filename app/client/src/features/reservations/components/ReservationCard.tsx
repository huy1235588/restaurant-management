import React from 'react';
import { Reservation } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { 
    Calendar, 
    Clock, 
    Users, 
    MapPin,
    Phone,
    Mail,
    Star,
    Cake,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { formatReservationTime } from '@/lib/utils/date';

interface ReservationCardProps {
    reservation: Reservation;
    onClick?: () => void;
    className?: string;
    compact?: boolean;
}

export function ReservationCard({ 
    reservation, 
    onClick, 
    className = '',
    compact = false 
}: ReservationCardProps) {
    const {
        reservationTime,
        customerName,
        phoneNumber,
        headCount,
        table,
        status,
        specialRequest,
        customer,
        tags,
    } = reservation;

    // Format time (HH:mm)
    const formattedTime = formatReservationTime(reservationTime);

    // Check for VIP or special tags
    const isVip = customer?.isVip || tags?.includes('vip');
    const hasBirthday = tags?.includes('birthday');
    const hasSpecialRequest = !!specialRequest;

    if (compact) {
        return (
            <Card 
                className={`p-4 hover:shadow-xl hover:border-primary/50 transition-all duration-200 cursor-pointer border-2 bg-gradient-to-br from-background to-muted/20 ${className}`}
                onClick={onClick}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-bold text-sm">{formattedTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 min-w-0">
                            {isVip && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                            {hasBirthday && <Cake className="h-4 w-4 text-pink-500 flex-shrink-0" />}
                            <span className="truncate font-semibold">{customerName}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{headCount}</span>
                        </div>
                        <StatusBadge status={status} />
                    </div>
                </div>
                
                {table && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Table {table.tableNumber}</span>
                        {table.floor && <span className="text-sm text-muted-foreground">• Floor {table.floor}</span>}
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card 
            className={`p-6 hover:shadow-2xl hover:border-primary/50 transition-all duration-200 cursor-pointer border-2 bg-gradient-to-br from-background via-background to-muted/20 ${className}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                    {/* Header - Time and Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
                            <Clock className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">{formattedTime}</span>
                        </div>
                        <StatusBadge status={status} />
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {isVip && (
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            )}
                            {hasBirthday && (
                                <Cake className="h-5 w-5 text-pink-500" />
                            )}
                            <span className="font-bold text-lg">{customerName}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Phone className="h-4 w-4 text-primary" />
                                <span className="font-medium">{phoneNumber}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="font-medium">{headCount} {headCount > 1 ? 'guests' : 'guest'}</span>
                            </div>

                            {table && (
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Table {table.tableNumber}</span>
                                    {table.floor && <span className="text-xs text-muted-foreground">• Floor {table.floor}</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Special Request */}
                    {hasSpecialRequest && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-900 dark:text-amber-100 line-clamp-2 font-medium">
                                {specialRequest}
                            </p>
                        </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span 
                                    key={tag}
                                    className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full border border-primary/30"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
