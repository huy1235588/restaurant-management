'use client';

import { useParams } from 'next/navigation';
import { useBill } from '@/modules/billing/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentStatusBadge, BillSummary } from '@/modules/billing/components';
import {
    ApplyDiscountDialog,
    ProcessPaymentDialog,
} from '@/modules/billing/dialogs/single';
import { PaymentStatus } from '@/modules/billing/types';
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@/modules/billing/utils';
import { ArrowLeft, Receipt, Percent, CreditCard, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function BillDetailsPage() {
    const params = useParams();
    const billId = Number(params.id);

    const { data: bill, isLoading } = useBill(billId);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">Loading bill details...</div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p>Bill not found</p>
                        <Link href="/bills">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Bills
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const canApplyDiscount = bill.paymentStatus === PaymentStatus.UNPAID;
    const canProcessPayment = bill.paymentStatus === PaymentStatus.UNPAID;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/bills">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{bill.billNumber}</h1>
                        <p className="text-muted-foreground">
                            Table {bill.order.table.tableNumber}
                        </p>
                    </div>
                </div>
                <PaymentStatusBadge status={bill.paymentStatus} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bill Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bill.billItems.map((item) => (
                                    <div
                                        key={item.billItemId}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium">{item.itemName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} x {formatCurrency(item.unitPrice)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            {formatCurrency(item.totalPrice)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {bill.payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bill.payments.map((payment) => (
                                        <div
                                            key={payment.paymentId}
                                            className="flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.paymentDate).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Summary & Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BillSummary bill={bill} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {canApplyDiscount && (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => setDiscountDialogOpen(true)}
                                >
                                    <Percent className="w-4 h-4 mr-2" />
                                    Apply Discount
                                </Button>
                            )}
                            {canProcessPayment && (
                                <Button
                                    className="w-full"
                                    onClick={() => setPaymentDialogOpen(true)}
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Process Payment
                                </Button>
                            )}
                            <Button className="w-full" variant="secondary">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Bill
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Order:</span>
                                <p className="font-medium">{bill.order.orderNumber}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Created:</span>
                                <p className="font-medium">
                                    {new Date(bill.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {bill.paidAt && (
                                <div>
                                    <span className="text-muted-foreground">Paid:</span>
                                    <p className="font-medium">
                                        {new Date(bill.paidAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <ApplyDiscountDialog
                open={discountDialogOpen}
                onOpenChange={setDiscountDialogOpen}
                billId={billId}
                currentStatus={bill.paymentStatus}
            />
            <ProcessPaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                billId={billId}
                totalAmount={bill.totalAmount}
                currentStatus={bill.paymentStatus}
            />
        </div>
    );
}
