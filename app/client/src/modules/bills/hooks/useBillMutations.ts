"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { billingApi } from "../services/billing.service";
import {
    CreateBillDto,
    ApplyDiscountDto,
    ProcessPaymentDto,
} from "../types";
import { billKeys } from "./useBills";
import { useTranslation } from "react-i18next";

/**
 * Hook to create a bill from an order
 */
export const useCreateBill = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: CreateBillDto) => billingApi.create(data),
        retry: 1,
        onSuccess: (bill) => {
            // Invalidate bills list
            queryClient.invalidateQueries({ queryKey: billKeys.lists() });
            // Invalidate orders list to update status
            queryClient.invalidateQueries({ queryKey: ["orders"] });

            toast.success(t("billing.messages.billCreated"));

            // Navigate to bill detail
            router.push(`/bills/${bill.billId}`);
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || t("billing.errors.createFailed")
            );
        },
    });
};

/**
 * Hook to apply discount to a bill
 */
export const useApplyDiscount = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApplyDiscountDto }) =>
            billingApi.applyDiscount(id, data),
        retry: 1,
        onSuccess: (bill) => {
            // Invalidate bill detail
            queryClient.invalidateQueries({ queryKey: billKeys.detail(bill.billId) });
            queryClient.invalidateQueries({ queryKey: billKeys.lists() });

            toast.success(t("billing.messages.discountApplied"));
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || t("billing.errors.discountFailed")
            );
        },
    });
};

/**
 * Hook to process payment for a bill
 */
export const useProcessPayment = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProcessPaymentDto }) =>
            billingApi.processPayment(id, data),
        retry: 1,
        onSuccess: (result) => {
            // Invalidate bill detail
            queryClient.invalidateQueries({
                queryKey: billKeys.detail(result.bill.billId),
            });
            queryClient.invalidateQueries({ queryKey: billKeys.lists() });
            // Invalidate orders list to update status
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            // Invalidate tables to update status
            queryClient.invalidateQueries({ queryKey: ["tables"] });

            toast.success(t("billing.messages.paymentProcessed"));
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || t("billing.errors.paymentFailed")
            );
        },
    });
};

/**
 * Hook to void/delete a bill (admin only)
 */
export const useVoidBill = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            billingApi.voidBill(id, reason),
        retry: 1,
        onSuccess: () => {
            // Invalidate bills list
            queryClient.invalidateQueries({ queryKey: billKeys.lists() });
            // Invalidate orders list to update status
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            // Invalidate tables to update status
            queryClient.invalidateQueries({ queryKey: ["tables"] });

            toast.success(t("billing.messages.billVoided"));

            // Navigate back to bills list
            router.push("/billing");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || t("billing.errors.voidFailed")
            );
        },
    });
};
