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
class LoginUserApiService {
    private api = axiosInstance;
    async blockUserApi(dataa: blockUserApiType) {

        try {
            const response = await this.api.post("/auth/block-user", dataa)


            return response.data
        } catch (error) {
            console.log("errorerrorerrorerror", error);

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    async unBlockUserApi(dataa: blockUserApiType) {

        try {
            const response = await this.api.post("/auth/unblock-user", dataa)
            console.log(response.data);


            return response.data
        } catch (error) {
            console.log("errorerrorerrorerror", error);

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }
    async deleteMeApi(id: string) {

        try {
            const response = await this.api.delete("/auth/delete-me-account", { data: { loginUserId: id } })
            console.log(response.data);


            return response.data
        } catch (error) {
            console.log("errorerrorerrorerror", error);

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }
    async updateMeApi(data: unknown) {
        console.log("datatatatat", data);

        try {
            const response = await this.api.patch("/auth/update-me", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log(response.data);


            return response.data
        } catch (error) {
            console.log("errorerrorerrorerror", error);

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    async getMeApi(data: unknown) {


        try {
            const response = await this.api.post("/auth/get-me", data)
            console.log(response.data);


            return response.data
        } catch (error) {
            console.log("errorerrorerrorerror", error);

            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    async getAllUsersApi() {
        try {
            const response = await this.api.get("/auth/get-all-users")
            return response.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to block this user.";
            toast.error(errMsg)
        }
    }

    // async changePasswordApi(data: changePasswordApiType) {
    //     console.log(data);

    //     try {
    //         const response = await this.api.patch("auth/change-password", data)
    //         return response.data

    //     } catch (error: unknown) {
    //         console.log(error);

    //         const errMsg = error instanceof Error ? error.response.data.message : "Failed to update the password."
    //         throw new Error(errMsg)

    //     }
    // }

    async changePasswordApi(data: changePasswordApiType) {
        console.log(data);

        try {
            const response = await this.api.patch("auth/change-password", data);
            return response.data;
        } catch (error: unknown) {
            console.log(error);

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
