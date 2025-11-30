import { ReservationAudit } from '../types';
import { formatReservationDateTime } from '../utils';
import { Check, X, UserCheck, Clock, CheckCircle, XCircle, Edit, User } from 'lucide-react';

interface AuditTimelineProps {
    audits: ReservationAudit[];
}

export function AuditTimeline({ audits }: AuditTimelineProps) {
    const getIconConfig = (action: string) => {
        switch (action) {
            case 'CONFIRMED':
                return {
                    icon: <Check className="w-4 h-4" />,
                    bgColor: 'bg-green-100 dark:bg-green-900',
                    iconColor: 'text-green-600 dark:text-green-400',
                    ringColor: 'ring-green-200 dark:ring-green-800'
                };
            case 'CANCELLED':
                return {
                    icon: <X className="w-4 h-4" />,
                    bgColor: 'bg-red-100 dark:bg-red-900',
                    iconColor: 'text-red-600 dark:text-red-400',
                    ringColor: 'ring-red-200 dark:ring-red-800'
                };
            case 'SEATED':
                return {
                    icon: <UserCheck className="w-4 h-4" />,
                    bgColor: 'bg-blue-100 dark:bg-blue-900',
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    ringColor: 'ring-blue-200 dark:ring-blue-800'
                };
            case 'COMPLETED':
                return {
                    icon: <CheckCircle className="w-4 h-4" />,
                    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
                    iconColor: 'text-emerald-600 dark:text-emerald-400',
                    ringColor: 'ring-emerald-200 dark:ring-emerald-800'
                };
            case 'NO_SHOW':
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    bgColor: 'bg-orange-100 dark:bg-orange-900',
                    iconColor: 'text-orange-600 dark:text-orange-400',
                    ringColor: 'ring-orange-200 dark:ring-orange-800'
                };
            case 'UPDATED':
                return {
                    icon: <Edit className="w-4 h-4" />,
                    bgColor: 'bg-purple-100 dark:bg-purple-900',
                    iconColor: 'text-purple-600 dark:text-purple-400',
                    ringColor: 'ring-purple-200 dark:ring-purple-800'
                };
            default:
                return {
                    icon: <Clock className="w-4 h-4" />,
                    bgColor: 'bg-gray-100 dark:bg-gray-800',
                    iconColor: 'text-gray-500 dark:text-gray-400',
                    ringColor: 'ring-gray-200 dark:ring-gray-700'
                };
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
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No activity history available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Actions will appear here as they occur</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {audits.map((audit, index) => {
                const config = getIconConfig(audit.action);
                const isLast = index === audits.length - 1;

                return (
                    <div key={audit.auditId} className="flex gap-4 group">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center relative">
                            <div className={`shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center ring-4 ${config.ringColor} ring-opacity-30 ${config.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:ring-opacity-50`}>
                                {config.icon}
                            </div>
                            {!isLast && (
                                <div className="w-0.5 h-full bg-linear-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 absolute top-10 bottom-0" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 group-hover:border-gray-300 dark:group-hover:border-gray-600">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                            {getActionText(audit.action)}
                                        </p>
                                        {audit.user && (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {audit.user.fullName}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        {formatReservationDateTime(audit.createdAt)}
                                    </span>
                                </div>

                                {audit.changes && Object.keys(audit.changes).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                            Changes Made
                                        </p>
                                        <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto">
                                                {JSON.stringify(audit.changes, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}