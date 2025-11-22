'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useBills } from '../hooks';
import { PaymentStatusBadge } from '../components';
import { PaymentStatus, BillFilters } from '../types';
import { formatCurrency } from '../utils';
import { Plus, Receipt } from 'lucide-react';
import Link from 'next/link';

export function BillListView() {
    const [filters, setFilters] = useState<BillFilters>({});
    const { data: bills, isLoading } = useBills(filters);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Bills</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bill
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Bills</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={filters.paymentStatus}
                                onValueChange={(value) =>
                                    setFilters({
                                        ...filters,
                                        paymentStatus: value as PaymentStatus,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                                    <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                                    <SelectItem value={PaymentStatus.PARTIAL}>
                                        Partial
                                    </SelectItem>
                                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, startDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, endDate: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="text-center py-8">Loading bills...</div>
            ) : !bills?.items || bills.items.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No bills found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bills.items.map((bill) => (
                        <Link key={bill.billId} href={`/billing/${bill.billId}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">
                                                {bill.billNumber}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Table {bill.order?.table.tableNumber}
                                            </p>
                                        </div>
                                        <PaymentStatusBadge status={bill.paymentStatus} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatCurrency(bill.subtotal)}</span>
                                        </div>
                                        {bill.discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-{formatCurrency(bill.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>{formatCurrency(bill.totalAmount)}</span>
                                        </div>
                                    </div>
                                    {bill.paymentStatus === PaymentStatus.PAID && (
                                        <div className="text-xs text-muted-foreground">
                                            Paid on {new Date(bill.updatedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
