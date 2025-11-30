"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Clock, Users, Phone, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReservation } from "../hooks/useReservation";
import type { ReservationFormData } from "../types";

// Form validation schema
const reservationSchema = z.object({
    customerName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phoneNumber: z.string()
        .min(10, "Số điện thoại phải có ít nhất 10 số")
        .regex(/^[0-9]+$/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    reservationDate: z.date({ error: "Vui lòng chọn ngày" }),
    reservationTime: z.string().min(1, "Vui lòng chọn giờ"),
    partySize: z.number().min(1, "Ít nhất 1 người").max(20, "Tối đa 20 người"),
    specialRequest: z.string().optional(),
});

type FormData = z.infer<typeof reservationSchema>;

// Time slots for reservation
const timeSlots = [
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00"
];

// Party sizes
const partySizes = Array.from({ length: 20 }, (_, i) => i + 1);

export function ReservationSection() {
    const { t, i18n } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    
    const { submitReservation, isLoading, reservation, reset } = useReservation();
    const [calendarOpen, setCalendarOpen] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            customerName: "",
            phoneNumber: "",
            email: "",
            partySize: 2,
            specialRequest: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        const formData: ReservationFormData = {
            customerName: data.customerName,
            phoneNumber: data.phoneNumber,
            email: data.email || undefined,
            reservationDate: data.reservationDate,
            reservationTime: data.reservationTime,
            partySize: data.partySize,
            specialRequest: data.specialRequest,
        };

        try {
            await submitReservation(formData);
            form.reset();
        } catch (err) {
            // Error handled in hook
        }
    };

    const handleNewReservation = () => {
        reset();
        form.reset();
    };

    // Success state
    if (reservation) {
        return (
            <section id="reservation" ref={ref} className="py-20 md:py-32 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto text-center"
                    >
                        <div className="bg-background rounded-2xl p-8 md:p-12 shadow-lg border">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                {t("home.reservation.successTitle", { defaultValue: "Đặt Bàn Thành Công!" })}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {t("home.reservation.successMessage", {
                                    defaultValue: "Cảm ơn bạn đã đặt bàn. Chúng tôi sẽ liên hệ để xác nhận."
                                })}
                            </p>
                            
                            <div className="bg-muted rounded-lg p-4 mb-6">
                                <p className="text-sm text-muted-foreground mb-1">
                                    {t("home.reservation.code", { defaultValue: "Mã đặt bàn:" })}
                                </p>
                                <p className="text-2xl font-mono font-bold text-primary">
                                    {reservation.reservationCode}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                                <div className="text-left">
                                    <p className="text-muted-foreground">
                                        {t("home.reservation.name", { defaultValue: "Tên:" })}
                                    </p>
                                    <p className="font-medium">{reservation.customerName}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground">
                                        {t("home.reservation.phone", { defaultValue: "SĐT:" })}
                                    </p>
                                    <p className="font-medium">{reservation.phoneNumber}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground">
                                        {t("home.reservation.date", { defaultValue: "Ngày:" })}
                                    </p>
                                    <p className="font-medium">{reservation.reservationDate}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground">
                                        {t("home.reservation.time", { defaultValue: "Giờ:" })}
                                    </p>
                                    <p className="font-medium">{reservation.reservationTime}</p>
                                </div>
                            </div>

                            <Button onClick={handleNewReservation} variant="outline">
                                {t("home.reservation.newBooking", { defaultValue: "Đặt Bàn Khác" })}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="reservation" ref={ref} className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {t("home.reservation.title", { defaultValue: "Đặt Bàn" })}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t("home.reservation.subtitle", {
                            defaultValue: "Đặt bàn trước để có trải nghiệm tốt nhất"
                        })}
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-4" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-2xl mx-auto"
                >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background rounded-2xl p-6 md:p-8 shadow-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Name */}
                            <div className="space-y-2">
                                <Label htmlFor="customerName" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {t("home.reservation.nameLabel", { defaultValue: "Họ và tên" })} *
                                </Label>
                                <Input
                                    id="customerName"
                                    placeholder={t("home.reservation.namePlaceholder", { defaultValue: "Nguyễn Văn A" })}
                                    {...form.register("customerName")}
                                    className={cn(form.formState.errors.customerName && "border-destructive")}
                                />
                                {form.formState.errors.customerName && (
                                    <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {t("home.reservation.phoneLabel", { defaultValue: "Số điện thoại" })} *
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="0912345678"
                                    {...form.register("phoneNumber")}
                                    className={cn(form.formState.errors.phoneNumber && "border-destructive")}
                                />
                                {form.formState.errors.phoneNumber && (
                                    <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {t("home.reservation.dateLabel", { defaultValue: "Ngày đặt" })} *
                                </Label>
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !form.watch("reservationDate") && "text-muted-foreground",
                                                form.formState.errors.reservationDate && "border-destructive"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("reservationDate") ? (
                                                format(form.watch("reservationDate"), "dd/MM/yyyy", {
                                                    locale: i18n.language === "vi" ? vi : undefined,
                                                })
                                            ) : (
                                                t("home.reservation.selectDate", { defaultValue: "Chọn ngày" })
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={form.watch("reservationDate")}
                                            onSelect={(date) => {
                                                form.setValue("reservationDate", date as Date);
                                                setCalendarOpen(false);
                                            }}
                                            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {form.formState.errors.reservationDate && (
                                    <p className="text-sm text-destructive">{form.formState.errors.reservationDate.message}</p>
                                )}
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {t("home.reservation.timeLabel", { defaultValue: "Giờ đặt" })} *
                                </Label>
                                <Select
                                    onValueChange={(value) => form.setValue("reservationTime", value)}
                                    value={form.watch("reservationTime")}
                                >
                                    <SelectTrigger className={cn(form.formState.errors.reservationTime && "border-destructive")}>
                                        <SelectValue placeholder={t("home.reservation.selectTime", { defaultValue: "Chọn giờ" })} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.reservationTime && (
                                    <p className="text-sm text-destructive">{form.formState.errors.reservationTime.message}</p>
                                )}
                            </div>

                            {/* Party Size */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {t("home.reservation.partySizeLabel", { defaultValue: "Số người" })} *
                                </Label>
                                <Select
                                    onValueChange={(value) => form.setValue("partySize", parseInt(value))}
                                    value={form.watch("partySize")?.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("home.reservation.selectPartySize", { defaultValue: "Chọn số người" })} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {partySizes.map((size) => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size} {t("home.reservation.guests", { defaultValue: "khách" })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {t("home.reservation.emailLabel", { defaultValue: "Email (không bắt buộc)" })}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    {...form.register("email")}
                                    className={cn(form.formState.errors.email && "border-destructive")}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            {/* Special Request */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="specialRequest" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    {t("home.reservation.specialRequestLabel", { defaultValue: "Yêu cầu đặc biệt" })}
                                </Label>
                                <Textarea
                                    id="specialRequest"
                                    placeholder={t("home.reservation.specialRequestPlaceholder", {
                                        defaultValue: "Ví dụ: Bàn gần cửa sổ, sinh nhật, kỷ niệm..."
                                    })}
                                    rows={3}
                                    {...form.register("specialRequest")}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-8"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("home.reservation.submitting", { defaultValue: "Đang xử lý..." })}
                                </>
                            ) : (
                                t("home.reservation.submit", { defaultValue: "Đặt Bàn" })
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
