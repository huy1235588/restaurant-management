'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { StepIndicator } from '../components/StepIndicator';
import { TableSelector } from '../components/TableSelector';
import { MenuItemSelector } from '../components/MenuItemSelector';
import { ShoppingCart } from '../components/ShoppingCart';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { useCreateOrder, useFullscreen } from '../hooks';
import { CreateOrderFormData, ShoppingCartItem, CreateOrderDto, OrderItem } from '../types';
import {
    step1TableSchema,
    step2CustomerSchema,
    step3MenuItemsSchema,
    step4ReviewSchema,
} from '../utils/order.schemas';
import { calculateOrderFinancials, formatCurrency } from '../utils';
import { ArrowLeft, ArrowRight, Save, AlertCircle, Keyboard, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'order-draft';
const STORAGE_DEBOUNCE_DELAY = 1000;
export function CreateOrderView() {
    const router = useRouter();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const storageTimerRef = useRef<NodeJS.Timeout | null>(null);

    const STEPS = [
        { id: 1, name: t('orders.create.steps.selectTable') },
        { id: 2, name: t('orders.create.steps.customerInfo') },
        { id: 3, name: t('orders.create.steps.selectItems') },
        { id: 4, name: t('orders.create.steps.confirm') },
    ];

    // Step 1: Table Selection
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

    // Step 2: Customer Information
    const customerForm = useForm({
        resolver: zodResolver(step2CustomerSchema),
        defaultValues: {
            customerName: '',
            customerPhone: '',
            partySize: 1,
            reservationId: undefined,
            specialRequests: '',
        },
    });

    const createOrderMutation = useCreateOrder();

    // Use custom fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    // Memoize order items calculation
    const tempOrderItems: OrderItem[] = useMemo(() =>
        cartItems.map((item, index) => ({
            orderItemId: index,
            orderId: 0,
            itemId: item.menuItemId,
            menuItem: {
                itemId: item.menuItemId,
                itemName: item.name,
                price: item.price,
                categoryId: 0,
                description: null,
                imageUrl: null,
                isAvailable: true,
            },
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            specialRequest: item.specialRequests || null,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })), [cartItems]
    );

    // Memoize financial calculations
    const financials = useMemo(() =>
        calculateOrderFinancials(tempOrderItems),
        [tempOrderItems]
    );

    // Memoize draft data
    const draftData = useMemo(() => ({
        step: currentStep,
        tableId: selectedTableId,
        cartItems,
        customerInfo: customerForm.getValues(),
        timestamp: new Date().toISOString(),
    }), [currentStep, selectedTableId, cartItems, customerForm]);

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

    // Save draft to localStorage with debouncing
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        // Clear existing timer
        if (storageTimerRef.current) {
            clearTimeout(storageTimerRef.current);
        }

        // Set new timer
        storageTimerRef.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
            } catch (error) {
                console.error('Failed to save draft:', error);
            }
            storageTimerRef.current = null;
        }, STORAGE_DEBOUNCE_DELAY);

        // Cleanup on unmount
        return () => {
            if (storageTimerRef.current) {
                clearTimeout(storageTimerRef.current);
            }
        };
    }, [draftData, hasUnsavedChanges]);

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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Always allow Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowKeyboardHelp(false);
                return;
            }

            // Prevent shortcuts when typing
            if (isInputField) return;

            switch (e.key.toLowerCase()) {
                case 'arrowright':
                    if (currentStep < 4) {
                        e.preventDefault();
                        handleNextStep();
                    }
                    break;
                case 'arrowleft':
                    if (currentStep > 1) {
                        e.preventDefault();
                        handlePreviousStep();
                    }
                    break;
                case 'enter':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (currentStep === 4) {
                            handleSubmit();
                        } else {
                            handleNextStep();
                        }
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (currentStep === 4) {
                            handleSubmit();
                        }
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    const step = parseInt(e.key);
                    if (step <= currentStep) {
                        e.preventDefault();
                        setCurrentStep(step);
                    }
                    break;
                case '?':
                    e.preventDefault();
                    setShowKeyboardHelp(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, hasUnsavedChanges, toggleFullscreen]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = confirm(t('orders.create.unsavedChangesWarning'));
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
                alert(t('orders.create.pleaseSelectTable'));
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
                alert(t('orders.create.pleaseAddItem'));
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
        const orderData: CreateOrderDto = {
            tableId: selectedTableId,
            items: cartItems.map((item) => ({
                itemId: item.menuItemId,
                quantity: item.quantity,
                specialRequest: item.specialRequests,
            })),
            customerName: customerInfo.customerName || undefined,
            customerPhone: customerInfo.customerPhone || undefined,
            partySize: customerInfo.partySize,
            notes: customerInfo.specialRequests || undefined,
        };

        await createOrderMutation.mutateAsync(orderData);
        localStorage.removeItem(STORAGE_KEY);
        setHasUnsavedChanges(false);
        // Navigation handled by useCreateOrder hook
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('orders.back')}
                    </Button>
                    <h1 className="text-3xl font-bold">{t('orders.create.title')}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setShowKeyboardHelp(true)} title={t('common.keyboardShortcuts')}>
                        <Keyboard className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={toggleFullscreen}>
                        {isFullscreen ? (
                            <Minimize2 className="mr-2 h-4 w-4" />
                        ) : (
                            <Maximize2 className="mr-2 h-4 w-4" />
                        )}
                        {isFullscreen ? "Exit" : "Fullscreen"}
                    </Button>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator
                steps={STEPS}
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
                                <CardTitle>{t('orders.create.selectTableTitle')}</CardTitle>
                                <CardDescription>
                                    {t('orders.create.selectTableDesc')}
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
                                <CardTitle>{t('orders.create.customerInfoTitle')}</CardTitle>
                                <CardDescription>
                                    {t('orders.create.customerInfoDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">{t('orders.create.customerName')}</Label>
                                        <Input
                                            id="customerName"
                                            placeholder={t('orders.create.customerNamePlaceholder')}
                                            {...customerForm.register('customerName')}
                                        />
                                        {customerForm.formState.errors.customerName && (
                                            <p className="text-sm text-destructive">
                                                {customerForm.formState.errors.customerName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">{t('orders.create.phone')}</Label>
                                        <Input
                                            id="customerPhone"
                                            placeholder={t('orders.create.phonePlaceholder')}
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
                                    <Label htmlFor="partySize">{t('orders.create.partySize')}</Label>
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
                                    <Label htmlFor="specialRequests">{t('orders.create.specialRequests')}</Label>
                                    <Textarea
                                        id="specialRequests"
                                        placeholder={t('orders.create.specialRequestsPlaceholder')}
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
                                <CardTitle>{t('orders.create.selectItemsTitle')}</CardTitle>
                                <CardDescription>
                                    {t('orders.create.selectItemsDesc')}
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
                                    <CardTitle>{t('orders.create.confirmTitle')}</CardTitle>
                                    <CardDescription>
                                        {t('orders.create.confirmDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">{t('orders.create.tableInfo')}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {t('orders.create.tableNumber')} {selectedTableId}
                                        </p>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            {t('orders.create.edit')}
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">{t('orders.create.customerInfoSection')}</h3>
                                        {customerForm.getValues().customerName && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">{t('orders.create.name')} </span>
                                                {customerForm.getValues().customerName}
                                            </p>
                                        )}
                                        {customerForm.getValues().customerPhone && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">{t('orders.create.phone')}: </span>
                                                {customerForm.getValues().customerPhone}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">{t('orders.create.partySizeLabel')} </span>
                                            {customerForm.getValues().partySize}
                                        </p>
                                        {customerForm.getValues().specialRequests && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">{t('orders.create.specialRequestsLabel')} </span>
                                                {customerForm.getValues().specialRequests}
                                            </p>
                                        )}
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            {t('orders.create.edit')}
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">{t('orders.items')} ({cartItems.length})</h3>
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
                                            {t('orders.create.edit')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {createOrderMutation.isError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {createOrderMutation.error?.message || t('orders.create.errorOccurred')}
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
                    {t('orders.create.previous')}
                </Button>
                {currentStep < 4 ? (
                    <Button onClick={handleNextStep}>
                        {t('orders.create.next')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={createOrderMutation.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {createOrderMutation.isPending ? t('orders.create.creating') : t('orders.create.createOrder')}
                    </Button>
                )}
            </div>

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('orders.create.keyboard.title')}</DialogTitle>
                        <DialogDescription>
                            {t('orders.create.keyboard.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.create.keyboard.navigation')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.nextStep')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{t('orders.create.keyboard.nextStepKey')}</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.prevStep')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">←</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.saveOrder')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+S</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.fullscreen')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F / F11</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.create.keyboard.jumpToStep')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.step1')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">1</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.step2')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">2</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.step3')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">3</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.create.keyboard.step4')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">4</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.other')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.showHelp')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.closeDialog')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
