import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export interface ReviewRecord {
  id: string;
  appointmentId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface ProviderReviewsResponse {
  reviews: ReviewRecord[];
  averageRating: number;
  totalReviews: number;
  page: number;
  limit: number;
}

export const reviewApiService = {
  createReview: async (payload: {
    appointmentId: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await axiosInstance.post(`/reviews`, payload);
    return response.data;
  },
  getProviderReviews: async (providerId: string, page = 1, limit = 20) => {
    const response = await axiosInstance.get(
      `/reviews/provider/${providerId}`,
      { params: { page, limit } },
    );
    return response.data;
  },
  getMyReviews: async () => {
    const response = await axiosInstance.get(`/reviews/me`);
    return response.data;
  },
};
