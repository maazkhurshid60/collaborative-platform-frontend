import axios, { AxiosInstance } from "axios";
import { baseUrl } from "../baseUrl/BaseUrl";

interface LoginData {
    email?: string;
    password: string;
}

interface LicenseNoData {
    licenseNo?: string;
}

class AuthService {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: `${baseUrl}/auth`,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    async login(data: LoginData) {

        try {
            const response = await this.api.post("/login", data);
            return response.data;
        } catch (error: unknown) {
            console.error("error", error);

            throw error || "Sign up failed";

        }
    }
    async forgotPassword(email: string) {



        try {
            const response = await this.api.post("/forgot-password", { email });
            return response.data;
        } catch (error: unknown) {
            console.error("error", error);

            throw error || "Sending Email Failed failed";

        }
    }


    async resetPassword(token: string, password: string) {
        try {
            const response = await this.api.patch(`/reset-password/${token}`, { newPassword: password });
            return response.data;
        } catch (error: unknown) {
            console.error("error", error);
            throw error || "Reset password failed";
        }
    }


    async findLicenseNo(data: LicenseNoData) {


        try {
            const response = await this.api.post("/license-found", data);
            return response.data;
        } catch (error: unknown) {
            throw error || "Sign up failed";

        }
    }

    async signup(data: unknown) {

        try {
            const response = await this.api.post("/signup", data);
            return response.data;
        } catch (error: unknown) {
            console.error("error singup", error);


            throw error || "Sign up failed";

        }
    }


}
// Export a single instance
const authService = new AuthService();
export default authService;

