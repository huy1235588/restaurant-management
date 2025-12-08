import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// Use relative API path by default so the client talks to the reverse proxy (Caddy)
// In production the reverse proxy should forward `/api/*` to the backend service.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Create axios instance
export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for authentication
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get access token from Zustand store (memory only)
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Cookies are sent automatically via withCredentials: true
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip refresh logic for auth endpoints like login/register/refresh to avoid infinite retries
        const skipRefreshEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
        const shouldSkipRefresh = skipRefreshEndpoints.some((endpoint) =>
            (originalRequest?.url || '').includes(endpoint)
        );

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh token (server will get refreshToken from HttpOnly cookie)
                const response = await axios.post(
                    `${API_URL}/auth/refresh`,
                    {},
                    {
                        withCredentials: true, // Send refresh token cookie
                    }
                );

                if (response.data.data?.accessToken) {
                    const newAccessToken = response.data.data.accessToken;

                    // Save new access token to Zustand store (memory only)
                    useAuthStore.getState().setAccessToken(newAccessToken);

                    // Update the failed request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }

                    processQueue(null);
                    isRefreshing = false;

                    // Retry original request
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed - logout user
                processQueue(refreshError as Error);
                isRefreshing = false;

                // Clear auth state
                useAuthStore.getState().clearAuth();

                // Only redirect to login if on admin routes (protected routes)
                if (typeof window !== 'undefined') {
                    const pathname = window.location.pathname;
                    const isAdminRoute = pathname.startsWith('/admin');
                    
                    if (isAdminRoute) {
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(refreshError);
            }
        }

        // Show error toast for non-401 errors
        if (error.response) {
            const errorMessage =
                (error.response.data as any)?.message ||
                error.message ||
                'An error occurred';
            
            // Don't show toast for auth errors (handled by redirect)
            if (error.response.status !== 401) {
                // Special handling for 403 Forbidden (permission denied)
                if (error.response.status === 403) {
                    toast.error('Bạn không có quyền thực hiện thao tác này');
                } else {
                    toast.error(errorMessage);
                }
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
