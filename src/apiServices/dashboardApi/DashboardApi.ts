import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";

export interface DashboardStats {
  activeProviders: number;
  pendingProviders: number;
  totalClients: number;
  totalRevenue: number;
  recentPendingProviders: any[];
  recentPayments: any[];
  recentActivities: any[];
}

class DashboardApiService {
  private api = axiosInstance;

  async getSuperAdminDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get("/super-admin/dashboard/stats");
      return response.data.data;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch dashboard stats.";
      toast.error(errMsg);
      throw error;
    }
  }
}

const dashboardApiService = new DashboardApiService();
export default dashboardApiService;
