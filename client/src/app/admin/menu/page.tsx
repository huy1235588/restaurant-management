// app/food-management/page.tsx
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
    CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Category, MenuFood } from '@/types/types';
import axios from "@/config/axios";
import "@/style/app.css";
import { useNotification } from "@/components/notificationProvider";

const FoodManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<MenuFood | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // Sample data với schema cũ
    const [categories, setCategories] = useState<Category[]>([]);
    // Lấy dữ liệu category từ API
    useEffect(() => {
        // API call
        const fetchData = async () => {
            try {
                const response = await axios.get<Category[]>('/api/category/all');
                setCategories(response.data);

            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchData();
    }, []);

    // Sample data với schema mới
    const [foodItems, setFoodItems] = useState<MenuFood[]>([]);
    // Lấy dữ liệu món ăn từ API
    useEffect(() => {
        // API call
        const fetchData = async () => {
            try {
                const response = await axios.get<MenuFood[]>('/api/menu/all');
                setFoodItems(response.data);

            } catch (error) {
                console.error('Failed to fetch menu food data:', error);
            }
        };

        fetchData();
    }, []);

    // Cột DataGrid
    const columns: GridColDef[] = [
        { field: 'itemId', headerName: 'Item ID', width: 120 },
        { field: 'itemName', headerName: 'Item Name', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
        {
            field: 'price',
            headerName: 'Price',
            width: 120,
            renderCell: (params) => `$${params.value.toFixed(2)}`
        },
        {
            field: 'categoryId',
            headerName: 'Category',
            width: 150,
            renderCell: (params) => {
                const category = categories.find(cat => cat.id === params.value);
                return category?.categoryName || 'Unknown';
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
                    onClick={() => handleDelete(params.row.itemId)}
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

        const newItem = {
            itemId: formData.get('itemId') as string,
            itemName: formData.get('itemName') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            categoryId: Number(formData.get('categoryId')),
        };

        // API call
        try {
            if (editItem) {
                // Update item
                await axios.put(`/api/menu/update/${editItem.itemId}`, newItem);

                // Update state
                setFoodItems(foodItems.map(item =>
                    item.itemId === editItem.itemId ? newItem : item
                ));

                showNotification(
                    'Item updated successfully',
                    'success'
                );
            } else {
                await axios.post('/api/menu/add', newItem);
                setFoodItems([...foodItems, newItem]);

                showNotification(
                    'Item created successfully',
                    'success'
                );
            }
        } catch (error) {
            console.error('Failed to save menu item:', error);
            showNotification(
                'Failed to save menu item',
                'error'
            );
            setLoading(false);
            return;
        } finally {
            setLoading(false);
            setOpen(false);
            setEditItem(null);
        }
    };

    // Xử lý chỉnh sửa item
    const handleEdit = (item: MenuFood) => {
        setEditItem(item);
        setOpen(true);
    };

    // Xử lý xóa item
    const handleDelete = (itemId: string) => {
        setFoodItems(foodItems.filter(item => item.itemId !== itemId));

        // API call
        axios.delete(`/api/menu/delete/${itemId}`)
            .then(() => {
                showNotification(
                    'Item deleted successfully',
                    'success'
                );
            })
            .catch(error => {
                console.error('Failed to delete item:', error);
                showNotification(
                    'Failed to delete item',
                    'error'
                );
            });
    };

    // Lọc items theo search term
    const filteredItems = foodItems.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="main main-food-management">
            <Box sx={{ p: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <TextField
                        label="Search items"
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
                        Add New Item
                    </Button>
                </Box>

                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredItems}
                        columns={columns}
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.itemId}
                    />
                </div>

                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                    <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
                                <TextField
                                    name="itemId"
                                    label="Item ID"
                                    defaultValue={editItem?.itemId}
                                    fullWidth
                                    required
                                    slotProps={{
                                        htmlInput:{
                                            maxLength: 10,
                                            readOnly: true
                                        }
                                    }}
                                />
                                <TextField
                                    name="itemName"
                                    label="Item Name"
                                    defaultValue={editItem?.itemName}
                                    fullWidth
                                    required
                                    inputProps={{ maxLength: 50 }}
                                />
                                <TextField
                                    name="description"
                                    label="Description"
                                    defaultValue={editItem?.description}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    inputProps={{ maxLength: 255 }}
                                />
                                <TextField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    defaultValue={editItem?.price}
                                    fullWidth
                                    required
                                    inputProps={{
                                        step: "0.01",
                                        min: "0"
                                    }}
                                    InputProps={{
                                        startAdornment: '$',
                                    }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="categoryId"
                                        label="Category"
                                        defaultValue={editItem?.categoryId || 1}
                                        required
                                    >
                                        {categories.map(category => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.categoryName}
                                            </MenuItem>
                                        ))}
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

export default FoodManagementPage;