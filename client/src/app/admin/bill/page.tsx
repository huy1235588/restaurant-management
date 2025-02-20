// app/bill/page.tsx
'use client'
import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Typography,
    styled
} from '@mui/material';

// Interface định nghĩa kiểu dữ liệu
interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

type PaymentMethod = 'cash' | 'card' | 'e-wallet';
type InvoiceType = 'personal' | 'company' | 'vat';

// Dữ liệu mẫu
const sampleItems: OrderItem[] = [
    { id: '1', name: 'Phở Bò', quantity: 2, price: 50000 },
    { id: '2', name: 'Bánh Mì', quantity: 1, price: 25000 },
    { id: '3', name: 'Nước Cam', quantity: 3, price: 15000 },
];

const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(4),
    margin: '2rem auto',
    maxWidth: 800,
    backgroundColor: '#fff9f5',
}));

const TotalText = styled(Typography)({
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: '1rem',
});

export default function BillPage() {
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('personal');
    const [isPaid, setIsPaid] = useState(false);

    // Tính tổng tiền
    const totalAmount = sampleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPayment(event.target.value as PaymentMethod);
    };

    const handleInvoiceTypeChange = (event: SelectChangeEvent) => {
        setInvoiceType(event.target.value as InvoiceType);
    };

    const handlePaymentConfirmation = () => {
        setIsPaid(true);
        // Xử lý thanh toán ở đây
    };

    if (isPaid) {
        return (
            <Box textAlign="center" p={4}>
                <Typography variant="h4" color="primary">
                    Thanh toán thành công!
                </Typography>
                <Typography variant="body1" mt={2}>
                    Cảm ơn quý khách!
                </Typography>
            </Box>
        );
    }

    return (
        <StyledCard>
            <Typography variant="h4" gutterBottom align="center">
                HÓA ĐƠN THANH TOÁN
            </Typography>

            {/* Danh sách món ăn */}
            <List>
                {sampleItems.map((item) => (
                    <div key={item.id}>
                        <ListItem>
                            <ListItemText
                                primary={item.name}
                                secondary={`Số lượng: ${item.quantity}`}
                            />
                            <Typography>{(item.price * item.quantity).toLocaleString()} VND</Typography>
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>

            <Grid container spacing={4} mt={2}>
                {/* Phương thức thanh toán */}
                <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Phương thức thanh toán</FormLabel>
                        <RadioGroup
                            value={selectedPayment}
                            onChange={handlePaymentChange}
                        >
                            <FormControlLabel
                                value="cash"
                                control={<Radio />}
                                label="Tiền mặt"
                            />
                            <FormControlLabel
                                value="card"
                                control={<Radio />}
                                label="Thẻ ngân hàng"
                            />
                            <FormControlLabel
                                value="e-wallet"
                                control={<Radio />}
                                label="Ví điện tử"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                {/* Loại hóa đơn */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <FormLabel>Loại hóa đơn</FormLabel>
                        <Select
                            value={invoiceType}
                            onChange={handleInvoiceTypeChange}
                            displayEmpty
                        >
                            <MenuItem value="personal">Hóa đơn cá nhân</MenuItem>
                            <MenuItem value="company">Hóa đơn công ty</MenuItem>
                            <MenuItem value="vat">Hóa đơn VAT</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Tổng tiền */}
            <TotalText variant="h6" align="right">
                Tổng cộng: {totalAmount.toLocaleString()} VND
            </TotalText>

            {/* Nút xác nhận */}
            <Box mt={4} textAlign="center">
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handlePaymentConfirmation}
                >
                    Xác nhận thanh toán
                </Button>
            </Box>
        </StyledCard>
    );
}