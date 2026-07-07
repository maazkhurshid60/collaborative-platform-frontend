import axios, { AxiosInstance } from "axios";
import { baseUrl } from "../baseUrl/BaseUrl";
import axiosInstance from "../axiosInstance/AxiosInstance";

interface LoginData {
    email?: string;
    password: string;
}

interface ClientIdData {
    clientId?: string;
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

    async generate2FA() {
        try {
            const response = await axiosInstance.post("/auth/2fa/generate");
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async enable2FA(token: string) {
        try {
            const response = await axiosInstance.post("/auth/2fa/enable", { token });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async verify2FA(userId: string, token: string, isRecoveryCode?: boolean) {
        try {
            const response = await this.api.post("/2fa/verify", { userId, token, isRecoveryCode });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async disable2FA(token: string, isRecoveryCode?: boolean) {
        try {
            const response = await axiosInstance.post("/auth/2fa/disable", { token, isRecoveryCode });
            return response.data;
        } catch (error) {
            throw error;
        }
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
    async findLicenseNo(data: ClientIdData) {


        try {
            const response = await axios.post(`${baseUrl}/user/license-found`, data);
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
    async verifyInvitation(token: string) {
        try {
            const response = await this.api.post("/verify-invitation", { token });
            return response.data;
        } catch (error: unknown) {
            console.error("error verifyInvitation", error);
            throw error || "Verification failed";
        }
    }

    async checkEmail(email: string, licenseNo?: string) {
        try {
            const response = await this.api.post("/check-email", { email, licenseNo });
            return response.data;
        } catch (error: unknown) {
            throw error;
        }
    }

    async getMe(loginUserId: string, role: string) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${baseUrl}/profile/get-me`,
                { loginUserId, role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error: unknown) {
            console.error("error getMe", error);
            throw error || "Get user failed";
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.post("/logout", {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: unknown) {
            console.error("error logout", error);
            // Even if backend fails, we should still clear local storage (handled in Sidebar)
        }
    }
    async resendVerification() {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.post("/resend-verification", {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: unknown) {
            console.error("error resendVerification", error);
            throw error;
        }
    }

    async verifyEmail(token: string) {
        try {
            const response = await this.api.post(`/verify-email/${token}`);
            return response.data;
        } catch (error: unknown) {
            console.error("error verifyEmail", error);
            throw error;
        }
    }

}
// Export a single instance
const authService = new AuthService();
export default authService;

