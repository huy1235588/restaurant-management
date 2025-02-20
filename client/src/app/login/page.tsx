"use client";
import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Alert,
    Typography,
    CssBaseline,
    Container
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// Thông tin đăng nhập mặc định để test
const TEST_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
};

interface LoginFormState {
    username: string;
    password: string;
    error: string;
    success: string;
}

export default function LoginPage() {
    const [state, setState] = useState<LoginFormState>({
        username: '',
        password: '',
        error: '',
        success: ''
    });

    useEffect(() => {
        if (state.error || state.success) {
            const timer = setTimeout(() => {
                setState(prev => ({ ...prev, error: '', success: '' }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.error, state.success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!state.username || !state.password) {
            setState(prev => ({ ...prev, error: 'Vui lòng điền đầy đủ thông tin' }));
            return;
        }

        if (state.username === TEST_CREDENTIALS.username &&
            state.password === TEST_CREDENTIALS.password) {
            setState({
                username: '',
                password: '',
                error: '',
                success: 'Đăng nhập thành công!'
            });

            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem('username', state.username);

            // Chuyển hướng đến trang quản lý
            window.location.href = '/admin/table';

        } else {
            setState(prev => ({
                ...prev,
                error: 'Thông tin đăng nhập không chính xác',
                password: ''
            }));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <LockIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                <Typography component="h1" variant="h5">
                    Đăng nhập
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    {state.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {state.error}
                        </Alert>
                    )}

                    {state.success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {state.success}
                        </Alert>
                    )}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Tên đăng nhập"
                        autoFocus
                        value={state.username}
                        onChange={(e) => setState(prev => ({ ...prev, username: e.target.value }))}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        value={state.password}
                        onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                    />

                    {/* Nút quên mật khẩu */}
                    <Button
                        sx={{ mt: 0.25, mb: 0.5 }}
                        variant="text"
                        color="primary"
                        href="/forgot-password"
                    >
                        Quên mật khẩu?

                    </Button>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1, mb: 2, py: 1.5 }}
                    >
                        Đăng nhập
                    </Button>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Tài khoản test: admin / password123
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}