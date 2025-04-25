
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
        console.log("log", loginUserDetail);

        try {
            const response = await this.api.post("/provider/get-all-providers", { loginUserId: loginUserDetail });
            return response?.data;
        } catch (error) {
            console.log("provider error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total provider";
            toast.error(errMsg);
        }
    }

}

const providerApiService = new ProviderApiService()
export default providerApiService










