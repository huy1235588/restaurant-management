// app/table-management/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { RestaurantTables } from '@/types/types';
import axios from "@/config/axios";
import "@/style/app.css";
import { useNotification } from "@/components/notificationProvider";

const TableManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<RestaurantTables | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // Mock data - thay thế bằng API call thực tế
    const [tables, setTables] = useState<RestaurantTables[]>([]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/tables/all");
                setTables(response.data || []);

            } catch (error) {
                console.error("Failed to fetch table data:", error);
            }
        };
        fetchData();
    }, []);

    // Cấu hình các cột cho DataGrid
    const columns: GridColDef[] = [
        { field: 'tableId', headerName: 'Table ID', width: 120 },
        { field: 'tableName', headerName: 'Table Name', width: 200 },
        { field: 'capacity', headerName: 'Capacity', width: 120 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                let color: 'success' | 'error' | 'warning' = 'success';
                if (params.value === 'occupied') color = 'error';
                else if (params.value === 'reserved') color = 'warning';

                return (
                    <Chip
                        label={params.value}
                        color={color}
                        variant="outlined"
                        size="small"
                    />
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key={1}
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => handleEdit(params.row)}
                />,
                <GridActionsCellItem
                    key={2}
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDelete(params.row.tableId)}
                />,
            ],
        },
    ];

    // Xử lý mở/đóng dialog
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEditItem(null);
    };

    // Xử lý submit form
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const newTable = {
            tableId: editItem?.tableId || Math.max(...tables.map(t => t.tableId), 0) + 1,
            tableName: formData.get('tableName') as string,
            capacity: Number(formData.get('capacity')),
            status: formData.get('status') as RestaurantTables['status'],
        };

       // Gọi API
        try {
            if (editItem) {
                await axios.put(`/api/tables/update/${editItem.tableId}`, newTable);
                setTables(tables.map(table => table.tableId === editItem.tableId ? newTable : table));
                showNotification("Table updated successfully", "success");
            } else {
                await axios.post("/api/tables/add", newTable);
                setTables([...tables, newTable]);
                showNotification("Table added successfully", "success");
            }
            handleClose();
        } catch (error) {
            console.error("Failed to update table:", error);
            showNotification("Failed to update table", "error");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý chỉnh sửa
    const handleEdit = (table: RestaurantTables) => {
        setEditItem(table);
        setOpen(true);
    };

    // Xử lý xóa
    const handleDelete = (tableId: number) => {
        // Gọi API
        axios.delete(`/api/tables/${tableId}`);

        // Cập nhật state
        setTables(tables.filter(table => table.tableId !== tableId));
    };

    // Lọc bàn theo tên
    const filteredTables = tables.filter(table =>
        table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="main main-table-panel">
            <Box sx={{ p: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <TextField
                        label="Search tables"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300 }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                    >
                        Add New Table
                    </Button>
                </Box>

                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredTables}
                        columns={columns}
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.tableId}
                    />
                </div>

                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                    <DialogTitle>{editItem ? 'Edit Table' : 'Add New Table'}</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
                                {editItem && (
                                    <TextField
                                        label="Table ID"
                                        value={editItem.tableId}
                                        disabled
                                        fullWidth
                                    />
                                )}
                                <TextField
                                    name="tableName"
                                    label="Table Name"
                                    defaultValue={editItem?.tableName}
                                    fullWidth
                                    required
                                    inputProps={{ maxLength: 50 }}
                                />
                                <TextField
                                    name="capacity"
                                    label="Capacity"
                                    type="number"
                                    defaultValue={editItem?.capacity}
                                    fullWidth
                                    required
                                    inputProps={{
                                        min: 1,
                                        step: 1
                                    }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        label="Status"
                                        defaultValue={editItem?.status || 'available'}
                                        required
                                    >
                                        <MenuItem value="available">Available</MenuItem>
                                        <MenuItem value="occupied">Occupied</MenuItem>
                                        <MenuItem value="reserved">Reserved</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} />}
                            >
                                {editItem ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </main>
    );
};

export default TableManagementPage;