import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    SelectChangeEvent, // Import kiểu SelectChangeEvent từ MUI
} from "@mui/material";
import { useTranslation } from 'react-i18next';

interface TableModalProps {
    tableId: number;
    initialBillId: number;
    onSubmit: (data: {
        customerName: string;
        phoneNumber: string;
        status: "hasCustomer" | "reserved";
        reservedTime?: string;
        billId: number;
    }) => void;
    onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ tableId, initialBillId, onSubmit, onClose }) => {
    const { t } = useTranslation(); // Sử dụng useTrans để lấy các chuỗi từ tệp TypeScript

    // State để lưu dữ liệu của form
    const [formData, setFormData] = useState({
        customerName: "",
        phoneNumber: "",
        status: "hasCustomer" as "hasCustomer" | "reserved", // Giá trị mặc định là "hasCustomer"
        reservedTime: "",
        billId: initialBillId,
    });

    // Hàm xử lý khi thay đổi dữ liệu trong TextField
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; // Lấy name và value từ sự kiện
        setFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu vào state
    };

    // Hàm xử lý khi thay đổi dữ liệu trong Select
    const handleSelectChange = (e: SelectChangeEvent<"hasCustomer" | "reserved">) => {
        const { name, value } = e.target; // Lấy name và value từ sự kiện
        setFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu vào state
    };

    // Hàm xử lý khi bấm nút Submit
    const handleFormSubmit = () => {
        // Kiểm tra nếu trạng thái là "reserved" mà không chọn thời gian thì hiển thị cảnh báo
        if (formData.status === "reserved" && !formData.reservedTime) {
            alert("Please select a reserved time."); // Thông báo lỗi
            return;
        }
        onSubmit(formData); // Gửi dữ liệu qua props onSubmit
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm"> {/* Hộp thoại (Dialog) của MUI */}
            <DialogTitle>Enter Customer Information</DialogTitle> {/* Tiêu đề hộp thoại */}
            <DialogContent>
                <Box mb={2}>Table ID: {tableId}</Box> {/* Hiển thị mã bàn */}

                {/* Ô nhập tên khách hàng */}
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('customerName')}
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                />

                {/* Ô nhập số điện thoại */}
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('phoneNumber')}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                />

                {/* Dropdown chọn trạng thái */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange} // Sử dụng handleSelectChange cho Select
                    >
                        <MenuItem value="hasCustomer">Dine-In</MenuItem>
                        <MenuItem value="reserved">Reserved</MenuItem>
                    </Select>
                </FormControl>

                {/* Nếu trạng thái là "reserved", hiển thị ô chọn thời gian */}
                {formData.status === "reserved" && (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Reserved Time"
                        name="reservedTime"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={formData.reservedTime}
                        onChange={handleInputChange}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                    />
                )}
            </DialogContent>

            {/* Các nút hành động */}
            <DialogActions>
                <Button onClick={handleFormSubmit} variant="contained" color="primary">
                    Submit
                </Button>
                <Button onClick={onClose} variant="outlined" color="secondary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TableModal;
