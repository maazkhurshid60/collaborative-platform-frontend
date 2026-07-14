import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";

export interface GetUsersPaginatedParams {
  page: number;
  limit: number;
  status?: string;
  role?: string;
  search?: string;
}

class UsersApiService {
  private api = axiosInstance;

  async getUsersPaginatedApi(params: GetUsersPaginatedParams) {
    try {
      const response = await this.api.get("/user/get-users-paginated", { params });
      return response.data.data;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch users.";
      toast.error(errMsg);
      throw error;
    }
  }
}

const usersApiService = new UsersApiService();
export default usersApiService;
