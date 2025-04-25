import axios from 'axios';
import { toast } from 'react-toastify';
import { baseUrl } from '../baseUrl/BaseUrl';


// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: baseUrl,
});


// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If unauthorized or token expired
        if (error.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            // Remove access token
            localStorage.removeItem('accessToken');

            // Redirect to login page
            window.location.href = '/login'; // Or use React Router's `navigate`
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
