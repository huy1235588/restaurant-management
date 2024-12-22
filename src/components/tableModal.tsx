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
import { useNotification } from "./notificationProvider";
import { TableBooking } from "@/types/types";

interface TableModalProps {
    tableId: number;
    initialBillId: number;
    onSubmit: (data: TableBooking) => void;
    onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ tableId, initialBillId, onSubmit, onClose }) => {
    const { showNotification } = useNotification();

    // State để lưu dữ liệu của form
    const [formData, setFormData] = useState<TableBooking>({
        tableId: tableId,
        billId: initialBillId,
        customerName: "",
        phoneNumber: "",
        reservedTime: "",
        numberOfGuests: 1,
        tableStatus: "occupied" as "occupied" | "reserved", // Giá trị mặc định là "occupied"
    });

    // Hàm xử lý khi thay đổi dữ liệu trong TextField
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; // Lấy name và value từ sự kiện
        setFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu vào state
    };

    // Hàm xử lý khi thay đổi dữ liệu trong Select
    const handleSelectChange = (e: SelectChangeEvent<"occupied" | "reserved">) => {
        const { name, value } = e.target; // Lấy name và value từ sự kiện
        setFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu vào state
    };

    // Hàm xử lý khi bấm nút Submit
    const handleFormSubmit = () => {
        // Kiểm tra nếu trạng thái là "reserved" mà không chọn thời gian thì hiển thị cảnh báo
        if (formData.tableStatus === "reserved" && !formData.reservedTime) {
            showNotification("Please select a reserved time.", "warning"); // Thông báo lỗi
            return;
        }
        onSubmit(formData); // Gửi dữ liệu qua props onSubmit
    };

    return (
        < Dialog
            open
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            disableScrollLock={true}
        >
            <DialogTitle>Enter Customer Information</DialogTitle> {/* Tiêu đề hộp thoại */}
            <DialogContent>
                <Box mb={2}>Table ID: {tableId}</Box> {/* Hiển thị mã bàn */}

                {/* Ô nhập tên khách hàng */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Customer Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                />

                {/* Ô nhập số điện thoại */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                />

                {/* Ô nhập lượng khách */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Number of Guests"
                    name="numberOfGuests"
                    type="number"
                    value={formData.numberOfGuests}
                    onChange={e => {
                        const value = parseInt(e.target.value, 10);
                        setFormData(prev => ({
                            ...prev,
                            numberOfGuests: isNaN(value) ? 1 : value,
                        }));
                    }}
                    inputProps={{ min: 1 }}
                />

                {/* Dropdown chọn trạng thái */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status"
                        value={formData.tableStatus}
                        onChange={handleSelectChange} // Sử dụng handleSelectChange cho Select
                    >
                        <MenuItem value="occupied">Dine-In</MenuItem>
                        <MenuItem value="reserved">Reserved</MenuItem>
                    </Select>
                </FormControl>

                {/* Nếu trạng thái là "reserved", hiển thị ô chọn thời gian */}
                {formData.tableStatus === "reserved" && (
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
        </Dialog >
    );
};

export default TableModal;
