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
    const formattedTime = reservationTime;

    // Check for VIP or special tags
    const isVip = customer?.isVip || tags?.includes('vip');
    const hasBirthday = tags?.includes('birthday');
    const hasSpecialRequest = !!specialRequest;

    if (compact) {
        return (
            <Card 
                className={`p-3 hover:shadow-md transition-shadow cursor-pointer ${className}`}
                onClick={onClick}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm">{formattedTime}</span>
                        
                        <div className="flex items-center gap-1 min-w-0">
                            {isVip && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                            {hasBirthday && <Cake className="h-3 w-3 text-pink-500 flex-shrink-0" />}
                            <span className="truncate text-sm">{customerName}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{headCount}</span>
                        </div>
                        <StatusBadge status={status} />
                    </div>
                </div>
                
                {table && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Table {table.tableNumber}</span>
                        {table.floor && <span>• Floor {table.floor}</span>}
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card 
            className={`p-4 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                    {/* Header - Time and Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-lg font-semibold">{formattedTime}</span>
                        </div>
                        <StatusBadge status={status} />
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {isVip && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            {hasBirthday && (
                                <Cake className="h-4 w-4 text-pink-500" />
                            )}
                            <span className="font-medium text-base">{customerName}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{phoneNumber}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{headCount} {headCount > 1 ? 'guests' : 'guest'}</span>
                            </div>

                            {table && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>Table {table.tableNumber}</span>
                                    {table.floor && <span className="text-xs">• Floor {table.floor}</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Special Request */}
                    {hasSpecialRequest && (
                        <div className="flex items-start gap-2 p-2 bg-muted/50 dark:bg-muted/20 rounded-md border border-border/50">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {specialRequest}
                            </p>
                        </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                                <span 
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-secondary/80 dark:bg-secondary/30 text-secondary-foreground rounded-full border border-border/50"
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
