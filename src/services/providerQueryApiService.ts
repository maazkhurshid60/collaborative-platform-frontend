import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export const providerQueryApiService = {
    getMyQueries: async () => {
        const response = await axiosInstance.get(`/provider-query/me`);
        return response.data;
    },
    deleteMyQuery: async (queryId: string) => {
        const response = await axiosInstance.delete(`/provider-query/me/${queryId}`);
        return response.data;
    },
};
