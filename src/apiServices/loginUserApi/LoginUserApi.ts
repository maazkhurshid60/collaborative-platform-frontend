import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import axios from "axios";

interface blockUserApiType {
    blockUserid: string
    loginUserId: string
}

interface changePasswordApiType {
    role: string
    loginUserId: string
    newPassword: string
    oldPassword: string
    confirmPassword: string
}

interface approveUserData {
    id: string | undefined,
    email: string | undefined,
    name: string | undefined
}
class LoginUserApiService {
    private api = axiosInstance;
    async blockUserApi(dataa: blockUserApiType) {

        try {
            const response = await this.api.post("/user/block-user", dataa)


            return response.data
        } catch (error) {

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    async unBlockUserApi(dataa: blockUserApiType) {

        try {
            const response = await this.api.post("/user/unblock-user", dataa)


            return response.data
        } catch (error) {

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }
    async deleteMeApi(id: string) {

        try {
            const response = await this.api.delete("/profile/delete-me-account", { data: { loginUserId: id } })


            return response.data
        } catch (error: any) {
            console.log("error", error);
            throw error;

        }
    }

    async deleteUserByAdminApi(targetUserId: string) {
        try {
            const response = await this.api.delete("/user/admin/delete-user", { data: { targetUserId } });
            return response.data;
        } catch (error: any) {
            console.log("error deleting user by admin", error);
            throw error;
        }
    }
    async updateMeApi(data: unknown) {

        try {
            const response = await this.api.patch("/profile/update-me", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data
        } catch (error) {
            console.error("ERROR UPDATE ME", error);

            const errMsg = error instanceof Error ? error.message : "Failed to update this user.";
            toast.error(errMsg)
        }
    }

    async getMeApi(data: unknown) {


        try {
            const response = await this.api.post("/profile/get-me", data)


            return response.data
        } catch (error) {

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    async getAllValidUsersApi() {
        try {
            const response = await this.api.get("/user/get-all-valid-users")
            return response.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }
    async getAllUsersApi() {
        try {
            const response = await this.api.get("/user/get-all-users")

            return response.data.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }
    async approveUsersApi(data: approveUserData) {
        try {
            const response = await this.api.patch("/user/approve-user", data)

            return response.data
        } catch (error) {
            console.error("error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to approve this user.";
            toast.error(errMsg)
        }
    }
    async rejectUsersApi(data: approveUserData) {
        try {
            const response = await this.api.patch("/user/reject-user", data)

            return response.data
        } catch (error) {
            console.error("error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to approve this user.";
            toast.error(errMsg)
        }
    }

    async restoreUsersApi(data: approveUserData) {
        try {
            const response = await this.api.patch("/user/restore-user", data)

            return response.data
        } catch (error) {
            console.error("error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to restore this user.";
            toast.error(errMsg)
        }
    }

    async changePasswordApi(data: changePasswordApiType) {

        try {
            const response = await this.api.patch("auth/change-password", data);
            return response.data;
        } catch (error: unknown) {

            let errMsg = "Failed to update the password.";

            if (axios.isAxiosError(error) && error.response?.data?.message) {
                errMsg = error.response.data.message;
            }

            throw new Error(errMsg);
        }
    }
}

const loginUserApiService = new LoginUserApiService()
export default loginUserApiService
