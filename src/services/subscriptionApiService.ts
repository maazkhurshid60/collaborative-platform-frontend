import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

const authenticatedAxiosInstance = axiosInstance;

export const subscriptionApiService = {
    createCheckoutSession: async (planType: string, period: string) => {
        const response = await authenticatedAxiosInstance.post(`/subscription/create-checkout-session`, { planType, period });
        return response.data;
    },

    createSubscriptionIntent: async (data: { email: string; name: string; planType: string; period: string }) => {
        // This is a public endpoint, use axiosInstance directly with relative path
        const response = await axiosInstance.post(`/subscription/intent`, data);
        return response.data;
    },

    activateFreePlan: async (planType?: string) => {
        const response = await authenticatedAxiosInstance.post(`/subscription/activate-free-plan`, { planType });
        return response.data;
    },

    getAllPayments: async () => {
        const response = await authenticatedAxiosInstance.get(`/subscription/payments`);
        return response.data;
    },

    cancelSubscription: async (reason: string) => {
        const response = await authenticatedAxiosInstance.post(`/subscription/cancel-subscription`, { reason });
        return response.data;
    },

    getAllInvoicesAdmin: async (providerId?: string) => {
        const query = providerId ? `?providerId=${providerId}` : '';
        const response = await authenticatedAxiosInstance.get(`/subscription/admin/invoices${query}`);
        return response.data;
    },

    syncSubscription: async () => {
        const response = await authenticatedAxiosInstance.post(`/subscription/sync`);
        return response.data;
    }
};
