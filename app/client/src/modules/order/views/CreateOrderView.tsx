'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepIndicator } from '../components/StepIndicator';
import { TableSelector } from '../components/TableSelector';
import { MenuItemSelector } from '../components/MenuItemSelector';
import { ShoppingCart } from '../components/ShoppingCart';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { useCreateOrder } from '../hooks';
import { CreateOrderFormData, ShoppingCartItem } from '../types';
import {
    step1TableSchema,
    step2CustomerSchema,
    step3MenuItemsSchema,
    step4ReviewSchema,
} from '../utils/order.schemas';
import { calculateOrderFinancials, formatCurrency } from '../utils';
import { ArrowLeft, ArrowRight, Save, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'order-draft';

export function CreateOrderView() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Step 1: Table Selection
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

    // Step 2: Customer Information
    const customerForm = useForm({
        resolver: zodResolver(step2CustomerSchema),
        defaultValues: {
            customerName: '',
            customerPhone: '',
            partySize: 1,
            specialRequests: '',
        },
    });

    const createOrderMutation = useCreateOrder();

    // Load draft from localStorage
    useEffect(() => {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
            try {
                const data = JSON.parse(draft);
                setCurrentStep(data.step || 1);
                setSelectedTableId(data.tableId || null);
                setCartItems(data.cartItems || []);
                customerForm.reset(data.customerInfo || {});
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        }
    }, []);

    // Save draft to localStorage
    useEffect(() => {
        if (hasUnsavedChanges) {
            const draft = {
                step: currentStep,
                tableId: selectedTableId,
                cartItems,
                customerInfo: customerForm.getValues(),
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        }
    }, [currentStep, selectedTableId, cartItems, customerForm, hasUnsavedChanges]);

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?');
            if (!confirmed) return;
        }
        localStorage.removeItem(STORAGE_KEY);
        router.push('/orders');
    };

    const handleStepClick = (step: number) => {
        // Only allow navigation to previous steps
        if (step < currentStep) {
            setCurrentStep(step);
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!selectedTableId) {
                alert('Vui lòng chọn bàn');
                return;
            }
            setCurrentStep(2);
            setHasUnsavedChanges(true);
        } else if (currentStep === 2) {
            customerForm.handleSubmit(() => {
                setCurrentStep(3);
                setHasUnsavedChanges(true);
            })();
        } else if (currentStep === 3) {
            if (cartItems.length === 0) {
                alert('Vui lòng thêm ít nhất một món');
                return;
            }
            setCurrentStep(4);
            setHasUnsavedChanges(true);
        }
    };

    const handlePreviousStep = () => {
        setCurrentStep(Math.max(1, currentStep - 1));
    };

    const handleSubmit = async () => {
        if (!selectedTableId || cartItems.length === 0) return;

        const customerInfo = customerForm.getValues();
        const orderData: CreateOrderFormData = {
            tableId: selectedTableId,
            items: cartItems.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                specialRequests: item.specialRequests,
            })),
            customerName: customerInfo.customerName || undefined,
            customerPhone: customerInfo.customerPhone || undefined,
            specialRequests: customerInfo.specialRequests || undefined,
        };

        await createOrderMutation.mutateAsync(orderData);
        localStorage.removeItem(STORAGE_KEY);
        setHasUnsavedChanges(false);
        // Navigation handled by useCreateOrder hook
    };

    const financials = calculateOrderFinancials(
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    const steps = [
        { number: 1, title: 'Chọn bàn', completed: currentStep > 1 },
        { number: 2, title: 'Thông tin khách', completed: currentStep > 2 },
        { number: 3, title: 'Chọn món', completed: currentStep > 3 },
        { number: 4, title: 'Xác nhận', completed: false },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold">Tạo đơn hàng mới</h1>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
            />

            {/* Step Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Chọn bàn</CardTitle>
                                <CardDescription>
                                    Chọn bàn để tạo đơn hàng
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TableSelector
                                    selectedTableId={selectedTableId}
                                    onSelect={setSelectedTableId}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin khách hàng</CardTitle>
                                <CardDescription>
                                    Nhập thông tin khách hàng (tùy chọn)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">Tên khách hàng</Label>
                                        <Input
                                            id="customerName"
                                            placeholder="Nguyễn Văn A"
                                            {...customerForm.register('customerName')}
                                        />
                                        {customerForm.formState.errors.customerName && (
                                            <p className="text-sm text-destructive">
                                                {customerForm.formState.errors.customerName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">Số điện thoại</Label>
                                        <Input
                                            id="customerPhone"
                                            placeholder="0912345678"
                                            {...customerForm.register('customerPhone')}
                                        />
                                        {customerForm.formState.errors.customerPhone && (
                                            <p className="text-sm text-destructive">
                                                {customerForm.formState.errors.customerPhone.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="partySize">Số người</Label>
                                    <Input
                                        id="partySize"
                                        type="number"
                                        min="1"
                                        {...customerForm.register('partySize', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {customerForm.formState.errors.partySize && (
                                        <p className="text-sm text-destructive">
                                            {customerForm.formState.errors.partySize.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                                    <Textarea
                                        id="specialRequests"
                                        placeholder="Ví dụ: Không hành, ít cay..."
                                        rows={3}
                                        {...customerForm.register('specialRequests')}
                                    />
                                    {customerForm.formState.errors.specialRequests && (
                                        <p className="text-sm text-destructive">
                                            {customerForm.formState.errors.specialRequests.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Chọn món</CardTitle>
                                <CardDescription>
                                    Thêm món ăn vào đơn hàng
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MenuItemSelector
                                    cartItems={cartItems}
                                    onAddItem={(item) => {
                                        setCartItems((prev) => {
                                            const existing = prev.find(
                                                (i) => i.menuItemId === item.menuItemId
                                            );
                                            if (existing) {
                                                return prev.map((i) =>
                                                    i.menuItemId === item.menuItemId
                                                        ? { ...i, quantity: i.quantity + item.quantity }
                                                        : i
                                                );
                                            }
                                            return [...prev, item];
                                        });
                                        setHasUnsavedChanges(true);
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Xác nhận đơn hàng</CardTitle>
                                    <CardDescription>
                                        Kiểm tra lại thông tin trước khi tạo đơn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Thông tin bàn</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Bàn số: {selectedTableId}
                                        </p>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                                        {customerForm.getValues().customerName && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Tên: </span>
                                                {customerForm.getValues().customerName}
                                            </p>
                                        )}
                                        {customerForm.getValues().customerPhone && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">SĐT: </span>
                                                {customerForm.getValues().customerPhone}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Số người: </span>
                                            {customerForm.getValues().partySize}
                                        </p>
                                        {customerForm.getValues().specialRequests && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Yêu cầu: </span>
                                                {customerForm.getValues().specialRequests}
                                            </p>
                                        )}
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Món ăn ({cartItems.length})</h3>
                                        <div className="space-y-2">
                                            {cartItems.map((item) => (
                                                <div
                                                    key={item.menuItemId}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span>
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => setCurrentStep(3)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {createOrderMutation.isError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {createOrderMutation.error?.message || 'Đã xảy ra lỗi'}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {currentStep === 3 && (
                        <ShoppingCart
                            items={cartItems}
                            onUpdateQuantity={(menuItemId, quantity) => {
                                setCartItems((prev) =>
                                    prev.map((item) =>
                                        item.menuItemId === menuItemId
                                            ? { ...item, quantity }
                                            : item
                                    )
                                );
                                setHasUnsavedChanges(true);
                            }}
                            onRemoveItem={(menuItemId) => {
                                setCartItems((prev) =>
                                    prev.filter((item) => item.menuItemId !== menuItemId)
                                );
                                setHasUnsavedChanges(true);
                            }}
                        />
                    )}

                    {(currentStep === 4 || cartItems.length > 0) && (
                        <OrderSummaryCard
                            subtotal={financials.subtotal}
                            serviceCharge={financials.serviceCharge}
                            tax={financials.tax}
                            discount={financials.discount}
                            total={financials.total}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                {currentStep < 4 ? (
                    <Button onClick={handleNextStep}>
                        Tiếp theo
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={createOrderMutation.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {createOrderMutation.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
                    </Button>
                )}
            </div>
        </div>
    );
}
