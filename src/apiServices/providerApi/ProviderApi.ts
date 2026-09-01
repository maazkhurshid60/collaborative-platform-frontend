
import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance"; // Adjust the path as needed

class ProviderApiService {
    private api = axiosInstance;

    async getAllTotalProviders() {
        try {
            const response = await this.api.get("/provider/get-total-providers"); // prepend /provider here
            return response?.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total provider";
            toast.error(errMsg);
        }
    }
    async getAllProviders(loginUserDetail: string) {

        try {
            const response = await this.api.post("/provider/get-all-providers?limit=10000", { loginUserId: loginUserDetail });
            return response?.data;
        } catch (error) {

            const errMsg = error instanceof Error ? error.message : "Failed to get total provider";
            toast.error(errMsg);
        }
    }

    async getProviderStats(loginUserId?: string) {
        try {
            const url = loginUserId ? `/provider/stats/${loginUserId}` : "/provider/stats";
            const response = await this.api.get(url);
            return response?.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get provider stats";
            toast.error(errMsg);
        }
    }
}

const providerApiService = new ProviderApiService()
export default providerApiService










