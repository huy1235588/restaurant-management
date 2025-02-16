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
    useTheme,
    SelectChangeEvent, // Import kiểu SelectChangeEvent từ MUI
} from "@mui/material";
import { useNotification } from "./notificationProvider";
import { Reservation } from "@/types/types";

interface TableModalProps {
    tableId: number;
    initialBillId: number;
    onSubmit: (data: Reservation) => void;
    onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ tableId, initialBillId, onSubmit, onClose }) => {
    const theme = useTheme(); // Sử dụng hook useTheme để lấy theme hiện tại
    const { showNotification } = useNotification();

    // State để lưu dữ liệu của form
    const [formData, setFormData] = useState<Reservation>({
        tableId: tableId,
        billId: initialBillId,
        customerName: "",
        reservationDate: "",
        reservationTime: "",
        headCount: 1,
        tableStatus: "occupied" as "occupied" | "reserved", // Giá trị mặc định là "occupied"

    });

    // Hàm xử lý khi thay đổi dữ liệu trong TextField
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; // Lấy name và value từ sự kiện
        setFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu vào state
    };

    // Hàm xử lý khi thay đổi dữ liệu trong Select
    const handleStatusChange = (event: SelectChangeEvent<"occupied" | "reserved">) => {
        setFormData(prev => ({
            ...prev,
            tableStatus: event.target.value as "occupied" | "reserved"
        }));
    };

    // Hàm xử lý khi bấm nút Submit
    const handleFormSubmit = () => {
        // Kiểm tra nếu trạng thái là "reserved" mà không chọn thời gian thì hiển thị cảnh báo
        if (formData.tableStatus === "reserved" && !formData.reservationDate) {
            showNotification("Please select a reserved time.", "warning"); // Thông báo lỗi
            return;
        }

        formData.reservationTime = formData.reservationDate; // Gán giá trị của reservationDate vào reservationTime

        onSubmit(formData); // Gửi dữ liệu qua props onSubmit
    };

    return (
        <Dialog
            className="table-modal" // Thêm class "table-modal" để tùy chỉnh CSS
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

                {/* Ô nhập lượng khách */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Number of Guests"
                    name="numberOfGuests"
                    type="number"
                    value={formData.headCount}
                    onChange={e => {
                        const value = parseInt(e.target.value, 10);
                        setFormData(prev => ({
                            ...prev,
                            numberOfGuests: isNaN(value) ? 1 : value,
                        }));
                    }}
                    slotProps={{
                        htmlInput: {
                            min: 1,
                        }
                    }}
                />

                {/* Dropdown chọn trạng thái */}
                <FormControl fullWidth margin="normal">
                    <InputLabel
                        className={`status-label ${theme.palette.mode === "dark" ? "dark" : ""} `}
                    >
                        Status
                    </InputLabel>
                    <Select
                        className="status-select"
                        name="status"
                        value={formData.tableStatus}
                        onChange={handleStatusChange}
                    >
                        <MenuItem className={`status-item ${theme.palette.mode === "dark" ? "dark" : ""}`}
                            value="occupied"
                        >
                            Dine-In
                        </MenuItem>
                        <MenuItem className={`status-item ${theme.palette.mode === "dark" ? "dark" : ""}`}
                            value="reserved"
                        >
                            Reserved
                        </MenuItem>
                    </Select>
                </FormControl>

                {/* Nếu trạng thái là "reserved", hiển thị ô chọn thời gian */}
                {formData.tableStatus === "reserved" && (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Reserved Time"
                        name="reservationDate"
                        type="datetime-local"
                        value={formData.reservationDate}
                        onChange={handleInputChange}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                        sx={{
                            colorScheme: "light"
                        }}
                    />
                )}

                <TextField
                    fullWidth
                    multiline
                    margin="normal"
                    label="Note"
                    name="specialRequest"
                    value={formData.specialRequest}
                    onChange={handleInputChange}
                    placeholder="E.g., Near window, Birthday setup, etc."
                />
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
