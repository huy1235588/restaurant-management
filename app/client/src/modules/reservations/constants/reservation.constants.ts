/**
 * Reservation Module Constants
 * Centralized constants for reservation management and workflow
 */

import { ReservationStatus } from '../types';

/**
 * Reservation status labels (Vietnamese)
 */
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    seated: 'Đã vào bàn',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    no_show: 'Không đến',
};

/**
 * Status colors for badges
 */
export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    seated: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    no_show: 'bg-orange-100 text-orange-800 border-orange-200',
};

/**
 * Status gradient colors for enhanced badges
 */
export const RESERVATION_STATUS_GRADIENTS: Record<ReservationStatus, string> = {
    pending:
        'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    confirmed:
        'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    seated:
        'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    completed:
        'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    cancelled:
        'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    no_show:
        'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
};

/**
 * Status descriptions (for tooltips/help text)
 */
export const RESERVATION_STATUS_DESCRIPTIONS: Record<ReservationStatus, string> = {
    pending: 'Đặt bàn mới, chờ nhân viên xác nhận',
    confirmed: 'Đã được xác nhận, chờ khách đến',
    seated: 'Khách đã đến và vào bàn, có thể gọi món',
    completed: 'Khách đã dùng xong và hoàn thành',
    cancelled: 'Đặt bàn đã bị hủy',
    no_show: 'Khách không đến trong thời gian chờ',
};

/**
 * Workflow constants - Critical for reservation → order flow
 */
export const RESERVATION_WORKFLOW = {
    // Status transitions
    TRANSITIONS: {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['seated', 'cancelled', 'no_show'],
        seated: ['completed'],
        completed: [],
        cancelled: [],
        no_show: [],
    } as Record<ReservationStatus, ReservationStatus[]>,

    // Available actions per status
    ACTIONS: {
        pending: ['confirm', 'cancel', 'edit'],
        confirmed: ['seat', 'cancel', 'mark_no_show', 'edit'],
        seated: ['complete', 'create_order'],
        completed: [],
        cancelled: [],
        no_show: [],
    } as Record<ReservationStatus, string[]>,

    // Time thresholds
    GRACE_PERIOD_MINUTES: 15, // Chờ khách 15 phút
    AUTO_NO_SHOW_MINUTES: 30, // Auto đánh dấu no-show sau 30 phút
    MIN_ADVANCE_BOOKING_MINUTES: 30, // Đặt trước tối thiểu 30 phút
    MAX_ADVANCE_BOOKING_DAYS: 90, // Đặt trước tối đa 90 ngày
    DEFAULT_DURATION_MINUTES: 120, // Mặc định 2 giờ
} as const;

/**
 * Validation rules
 */
export const RESERVATION_VALIDATION = {
    MIN_PARTY_SIZE: 1,
    MAX_PARTY_SIZE: 20,
    MIN_CUSTOMER_NAME_LENGTH: 2,
    MAX_CUSTOMER_NAME_LENGTH: 100,
    PHONE_NUMBER_LENGTH: 10,
    MAX_SPECIAL_REQUEST_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MAX_CANCELLATION_REASON_LENGTH: 500,
    MIN_CANCELLATION_REASON_LENGTH: 10,
    MIN_DURATION_MINUTES: 30,
    MAX_DURATION_MINUTES: 480, // 8 hours
} as const;

/**
 * Pagination defaults
 */
export const RESERVATION_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * API messages
 */
export const RESERVATION_MESSAGES = {
    SUCCESS: {
        CREATED: 'Đặt bàn thành công',
        UPDATED: 'Cập nhật đặt bàn thành công',
        CONFIRMED: 'Xác nhận đặt bàn thành công',
        SEATED: 'Đã vào bàn thành công',
        COMPLETED: 'Hoàn thành đặt bàn',
        CANCELLED: 'Hủy đặt bàn thành công',
        MARKED_NO_SHOW: 'Đánh dấu không đến thành công',
        ORDER_CREATED: 'Tạo đơn hàng thành công',
        AVAILABILITY_CHECKED: 'Kiểm tra bàn trống thành công',
    },
    ERROR: {
        CREATE_FAILED: 'Không thể tạo đặt bàn',
        UPDATE_FAILED: 'Không thể cập nhật đặt bàn',
        CONFIRM_FAILED: 'Không thể xác nhận đặt bàn',
        SEAT_FAILED: 'Không thể vào bàn',
        COMPLETE_FAILED: 'Không thể hoàn thành',
        CANCEL_FAILED: 'Không thể hủy đặt bàn',
        NO_SHOW_FAILED: 'Không thể đánh dấu không đến',
        FETCH_FAILED: 'Không thể tải danh sách đặt bàn',
        NOT_FOUND: 'Không tìm thấy đặt bàn',
        INVALID_STATUS: 'Trạng thái không hợp lệ',
        INVALID_DATE: 'Ngày không hợp lệ',
        INVALID_TIME: 'Giờ không hợp lệ',
        INVALID_PARTY_SIZE: 'Số lượng khách không hợp lệ',
        PHONE_REQUIRED: 'Vui lòng nhập số điện thoại',
        PHONE_INVALID: 'Số điện thoại không hợp lệ',
        NAME_REQUIRED: 'Vui lòng nhập tên khách hàng',
        NAME_TOO_SHORT: `Tên phải có ít nhất ${RESERVATION_VALIDATION.MIN_CUSTOMER_NAME_LENGTH} ký tự`,
        DATE_REQUIRED: 'Vui lòng chọn ngày',
        TIME_REQUIRED: 'Vui lòng chọn giờ',
        DATE_PAST: 'Không thể đặt bàn trong quá khứ',
        DATE_TOO_EARLY: `Vui lòng đặt trước ít nhất ${RESERVATION_WORKFLOW.MIN_ADVANCE_BOOKING_MINUTES} phút`,
        DATE_TOO_FAR: `Chỉ có thể đặt trong vòng ${RESERVATION_WORKFLOW.MAX_ADVANCE_BOOKING_DAYS} ngày`,
        NO_TABLES_AVAILABLE: 'Không có bàn trống vào thời gian này',
        TABLE_NOT_AVAILABLE: 'Bàn không còn trống',
        CANCELLATION_REASON_REQUIRED: 'Vui lòng nhập lý do hủy',
        CANCELLATION_REASON_TOO_SHORT: `Lý do hủy phải có ít nhất ${RESERVATION_VALIDATION.MIN_CANCELLATION_REASON_LENGTH} ký tự`,
        CANNOT_EDIT: 'Không thể chỉnh sửa đặt bàn này',
        CANNOT_CANCEL: 'Không thể hủy đặt bàn này',
        CANNOT_SEAT: 'Không thể vào bàn lúc này',
        NOT_SEATED: 'Chưa vào bàn, không thể tạo đơn',
    },
    CONFIRMATION: {
        CANCEL: 'Bạn có chắc chắn muốn hủy đặt bàn này?',
        MARK_NO_SHOW: 'Đánh dấu khách không đến?',
        DELETE: 'Bạn có chắc chắn muốn xóa đặt bàn này?',
        SEAT: 'Xác nhận khách đã đến và vào bàn?',
        COMPLETE: 'Xác nhận hoàn thành đặt bàn?',
    },
    INFO: {
        CHECKING_AVAILABILITY: 'Đang kiểm tra bàn trống...',
        CREATING_ORDER: 'Đang tạo đơn hàng...',
        GRACE_PERIOD: `Chờ khách ${RESERVATION_WORKFLOW.GRACE_PERIOD_MINUTES} phút`,
        AUTO_NO_SHOW: `Tự động đánh dấu không đến sau ${RESERVATION_WORKFLOW.AUTO_NO_SHOW_MINUTES} phút`,
    },
} as const;

/**
 * Editable status list (statuses that allow modifications)
 */
export const EDITABLE_RESERVATION_STATUSES: readonly ReservationStatus[] = [
    'pending',
    'confirmed',
] as const;

/**
 * Cancellable status list
 */
export const CANCELLABLE_RESERVATION_STATUSES: readonly ReservationStatus[] = [
    'pending',
    'confirmed',
] as const;

/**
 * Active reservation statuses (not finalized)
 */
export const ACTIVE_RESERVATION_STATUSES: readonly ReservationStatus[] = [
    'pending',
    'confirmed',
    'seated',
] as const;

/**
 * Finalized reservation statuses
 */
export const FINALIZED_RESERVATION_STATUSES: readonly ReservationStatus[] = [
    'completed',
    'cancelled',
    'no_show',
] as const;

/**
 * Sort options for reservation list
 */
export const RESERVATION_SORT_OPTIONS = [
    { value: 'reservationDate', label: 'Ngày đặt' },
    { value: 'reservationTime', label: 'Giờ đặt' },
    { value: 'createdAt', label: 'Thời gian tạo' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'partySize', label: 'Số lượng khách' },
] as const;

/**
 * Filter options for reservation list
 */
export const RESERVATION_FILTER_OPTIONS = {
    statuses: [
        { value: 'pending', label: RESERVATION_STATUS_LABELS.pending },
        { value: 'confirmed', label: RESERVATION_STATUS_LABELS.confirmed },
        { value: 'seated', label: RESERVATION_STATUS_LABELS.seated },
        { value: 'completed', label: RESERVATION_STATUS_LABELS.completed },
        { value: 'cancelled', label: RESERVATION_STATUS_LABELS.cancelled },
        { value: 'no_show', label: RESERVATION_STATUS_LABELS.no_show },
    ],
    timeSlots: [
        { value: 'breakfast', label: 'Sáng (6h-11h)', start: 6, end: 11 },
        { value: 'lunch', label: 'Trưa (11h-14h)', start: 11, end: 14 },
        { value: 'afternoon', label: 'Chiều (14h-17h)', start: 14, end: 17 },
        { value: 'dinner', label: 'Tối (17h-21h)', start: 17, end: 21 },
        { value: 'late_night', label: 'Khuya (21h-)', start: 21, end: 24 },
    ],
} as const;

/**
 * Time slot labels
 */
export const TIME_SLOT_LABELS = {
    breakfast: 'Sáng',
    lunch: 'Trưa',
    afternoon: 'Chiều',
    dinner: 'Tối',
    late_night: 'Khuya',
} as const;

/**
 * Date range presets
 */
export const DATE_RANGE_PRESETS = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Ngày mai', value: 'tomorrow' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tuần sau', value: 'next_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Tháng sau', value: 'next_month' },
] as const;

/**
 * Local storage keys
 */
export const RESERVATION_STORAGE_KEYS = {
    FILTER_PREFERENCES: 'reservation_filter_preferences',
    VIEW_MODE: 'reservation_view_mode',
    SORT_PREFERENCES: 'reservation_sort_preferences',
} as const;

/**
 * WebSocket events (if using real-time updates)
 */
export const RESERVATION_SOCKET_EVENTS = {
    RESERVATION_CREATED: 'reservation:created',
    RESERVATION_UPDATED: 'reservation:updated',
    RESERVATION_CONFIRMED: 'reservation:confirmed',
    RESERVATION_SEATED: 'reservation:seated',
    RESERVATION_COMPLETED: 'reservation:completed',
    RESERVATION_CANCELLED: 'reservation:cancelled',
    RESERVATION_NO_SHOW: 'reservation:no_show',
} as const;

/**
 * Action button configurations
 */
export const RESERVATION_ACTION_BUTTONS = {
    confirm: {
        label: 'Xác nhận',
        icon: 'CheckCircle',
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700',
    },
    seat: {
        label: 'Vào bàn',
        icon: 'Users',
        variant: 'default' as const,
        className: 'bg-purple-600 hover:bg-purple-700',
    },
    complete: {
        label: 'Hoàn thành',
        icon: 'Check',
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700',
    },
    cancel: {
        label: 'Hủy',
        icon: 'XCircle',
        variant: 'destructive' as const,
        className: '',
    },
    mark_no_show: {
        label: 'Không đến',
        icon: 'AlertCircle',
        variant: 'secondary' as const,
        className: '',
    },
    edit: {
        label: 'Chỉnh sửa',
        icon: 'Edit',
        variant: 'outline' as const,
        className: '',
    },
    create_order: {
        label: 'Gọi món',
        icon: 'Plus',
        variant: 'default' as const,
        className: 'bg-indigo-600 hover:bg-indigo-700',
    },
} as const;
