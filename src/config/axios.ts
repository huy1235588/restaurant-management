import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true      // Để gửi kèm cookie trong yêu cầu
});

// Thay đổi cấu hình mặc định sau khi đã tạo instance
// instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

// Thêm một interceptor cho yêu cầu (request)
instance.interceptors.request.use(function (config) {
    // Xử lý trước khi họi request
    return config;
}, function (error) {
    // Xử lý khi request lỗi
    return Promise.reject(error);
});

// Thêm một interceptor cho phản hồi (response)
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

export default instance;