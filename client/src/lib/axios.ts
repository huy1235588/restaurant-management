import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
export const axiosInstance = axios.create({
    baseURL: API_URL + '/api/v1',
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

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
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

                // Redirect to login if not already there
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
