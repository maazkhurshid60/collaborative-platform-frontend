import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export const providerProfileApiService = {
    getMyProfile: async () => {
        const response = await axiosInstance.get(`/provider-profile/me`);
        return response.data;
    },

    updateMyProfile: async (data: Record<string, unknown>) => {
        const response = await axiosInstance.put(`/provider-profile/me`, data);
        return response.data;
    },

    setPublished: async (isPublished: boolean) => {
        const response = await axiosInstance.patch(`/provider-profile/publish`, { isPublished });
        return response.data;
    },

    // superAdmin only
    setVerificationFlags: async (
        providerId: string,
        flags: { identityVerified?: boolean; backgroundChecked?: boolean },
    ) => {
        const response = await axiosInstance.patch(`/provider-profile/${providerId}/verification`, flags);
        return response.data;
    },

    getPublicProfile: async (slug: string) => {
        const response = await axiosInstance.get(`/provider-profile/public/${slug}`);
        return response.data;
    },

    searchPublic: async (filters: { q?: string; specialty?: string }) => {
        const params = new URLSearchParams();
        if (filters.q) params.set("q", filters.q);
        if (filters.specialty) params.set("specialty", filters.specialty);

        const response = await axiosInstance.get(`/provider-profile/public-search?${params.toString()}`);
        return response.data;
    },
};
