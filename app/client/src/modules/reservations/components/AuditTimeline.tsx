import { ReservationAudit } from '../types';
import { formatReservationDateTime } from '../utils';
import { Check, X, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AuditTimelineProps {
    audits: ReservationAudit[];
}

export function AuditTimeline({ audits }: AuditTimelineProps) {
    const getIcon = (action: string) => {
        switch (action) {
            case 'CONFIRMED':
                return <Check className="w-4 h-4 text-green-600" />;
            case 'CANCELLED':
                return <X className="w-4 h-4 text-red-600" />;
            case 'SEATED':
                return <UserCheck className="w-4 h-4 text-blue-600" />;
            case 'COMPLETED':
                return <CheckCircle className="w-4 h-4 text-gray-600" />;
            case 'NO_SHOW':
                return <XCircle className="w-4 h-4 text-orange-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActionText = (action: string) => {
        switch (action) {
            case 'CONFIRMED':
                return 'Reservation confirmed';
            case 'CANCELLED':
                return 'Reservation cancelled';
            case 'SEATED':
                return 'Customer checked in';
            case 'COMPLETED':
                return 'Reservation completed';
            case 'NO_SHOW':
                return 'Marked as no-show';
            case 'UPDATED':
                return 'Details updated';
            default:
                return action;
        }
    };

    if (audits.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No activity history available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {audits.map((audit, index) => (
                <div key={audit.auditId} className="flex gap-3">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {getIcon(audit.action)}
                        </div>
                        {index < audits.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium text-gray-900">
                                    {getActionText(audit.action)}
                                </p>
                                {audit.user && (
                                    <p className="text-sm text-gray-600 mt-1">by {audit.user.fullName}</p>
                                )}
                                {audit.changes && Object.keys(audit.changes).length > 0 && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p className="font-medium">Changes:</p>
                                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">
                                            {JSON.stringify(audit.changes, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {formatReservationDateTime(audit.createdAt)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
