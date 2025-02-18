// app/payment/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Divider,
    Chip,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface PaymentData {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: 'cash' | 'creditCard' | 'mobile';
}

const PaymentPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [paymentData, setPaymentData] = useState<PaymentData>({
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        paymentMethod: 'cash'
    });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock data - replace with API calls
    const [tables] = useState([
        { id: 1, name: 'Table 1', status: 'occupied' },
        { id: 2, name: 'VIP Booth', status: 'occupied' }
    ]);

    const [menuItems] = useState([
        { id: 'APP001', name: 'Spring Rolls', price: 5.99 },
        { id: 'MN002', name: 'Beef Steak', price: 15.99 },
        { id: 'DS003', name: 'Ice Cream', price: 4.99 }
    ]);

    // Các bước trong quy trình thanh toán
    const steps = ['Select Table', 'Order Items', 'Payment'];

    // Cập nhật tổng số tiền khi thay đổi order
    useEffect(() => {
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // Giả sử thuế 10%
        const total = subtotal + tax - paymentData.discount;

        setPaymentData(prev => ({
            ...prev,
            subtotal,
            tax,
            total: total > 0 ? total : 0
        }));
    }, [orderItems, paymentData.discount]);

    // Cột cho bảng chọn món
    const menuColumns: GridColDef[] = [
        { field: 'name', headerName: 'Item Name', width: 200 },
        {
            field: 'price', headerName: 'Price', width: 120,
            renderCell: (params) => `$${params.value.toFixed(2)}`
        },
        {
            field: 'actions',
            headerName: 'Add to Order',
            width: 120,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    onClick={() => handleAddItem(params.row)}
                >
                    Add
                </Button>
            )
        }
    ];

    // Xử lý thêm món vào order
    const handleAddItem = (item: any) => {
        setOrderItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setOrderItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Xử lý thanh toán
    const handlePayment = async () => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            setLoading(false);
            setOpenConfirm(false);
            setActiveStep(0);
            setOrderItems([]);
            setSelectedTable(null);
        }, 2000);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === 0 && (
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={tables.filter(t => t.status === 'occupied')}
                        columns={[
                            { field: 'name', headerName: 'Table Name', width: 200 },
                            {
                                field: 'status', headerName: 'Status', width: 150,
                                renderCell: (params) => (
                                    <Chip
                                        label={params.value}
                                        color="warning"
                                        variant="outlined"
                                    />
                                )
                            },
                            {
                                field: 'actions',
                                headerName: 'Select',
                                width: 120,
                                renderCell: (params) => (
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setSelectedTable(params.row.id);
                                            setActiveStep(1);
                                        }}
                                    >
                                        Select
                                    </Button>
                                )
                            }
                        ]}
                        disableRowSelectionOnClick
                    />
                </Box>
            )}

            {activeStep === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Search menu items"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={menuItems}
                                    columns={menuColumns}
                                    disableRowSelectionOnClick
                                />
                            </div>
                        </Box>
                    </Grid>

                    <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Current Order (Table {selectedTable})
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {orderItems.map(item => (
                                <Box key={item.id} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{item.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Button
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </Button>
                                            <Typography>{item.quantity}</Typography>
                                            <Button
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </Box>
                                        <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                </Box>
                            ))}

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={orderItems.length === 0}
                                onClick={() => setActiveStep(2)}
                                sx={{ mt: 2 }}
                            >
                                Proceed to Payment
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            )}

            {activeStep === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Details
                            </Typography>

                            <FormControl fullWidth sx={{ my: 2 }}>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData(prev => ({
                                        ...prev,
                                        paymentMethod: e.target.value as any
                                    }))}
                                    label="Payment Method"
                                >
                                    <MenuItem value="cash">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoneyIcon /> Cash
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="creditCard">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CreditCardIcon /> Credit Card
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="mobile">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocalDiningIcon /> Mobile Payment
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Discount Code"
                                fullWidth
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(1)}
                                >
                                    Back to Order
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => setOpenConfirm(true)}
                                    disabled={paymentData.total <= 0}
                                >
                                    Confirm Payment
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={4}>
                        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Summary
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Subtotal:</Typography>
                                    <Typography>${paymentData.subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Tax (10%):</Typography>
                                    <Typography>${paymentData.tax.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Discount:</Typography>
                                    <Typography>-${paymentData.discount.toFixed(2)}</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">Total:</Typography>
                                    <Typography variant="h6">
                                        ${paymentData.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Total Amount: ${paymentData.total.toFixed(2)}
                    </Alert>
                    <Typography>Payment Method: {paymentData.paymentMethod}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handlePayment}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    >
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentPage;