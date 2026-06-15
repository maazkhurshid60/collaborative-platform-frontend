import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { ClientType } from "../../types/clientType/ClientType";
import { isAxiosError } from "axios";
import { selectedClientIdType } from "../../pages/providerPages/clients/Clients";
import { baseUrl } from "../../apiServices/baseUrl/BaseUrl";
import { getApiBaseUrl } from "../config/api";

const API_BASE_URL = getApiBaseUrl();


class ClientApiService {
    private api = axiosInstance

    async getAllTotalClient() {
        try {

            const response = await this.api.get(`${API_BASE_URL}/client/get-total-clients`)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    async getAllClient(loginUserId: string) {
        try {

            const response = await this.api.post(`${API_BASE_URL}/client/get-all-clients?limit=1000`, { loginUserId })
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async getClientById(id: string) {
        try {
            const response = await this.api.get(`${API_BASE_URL}/client/get-client/${id}`)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get client details";
            toast.error(errMsg);
        }
    }
    async deleteClientApi(data: selectedClientIdType) {
        try {

            const response = await this.api.delete(`${API_BASE_URL}/client/delete-client`, { data: { clientId: data?.clientId, providerId: data?.providerId } })
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async updateClientApi(data: FormData) {

        try {
            const response = await this.api.patch(`${API_BASE_URL}/client/update-client`, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error: unknown) {


            throw error || "Update the client failed";

        }
    }

    async addClientApi(data: FormData) {
        const response = await this.api.post(`${API_BASE_URL}/client/add-client`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
    async addExistingClientToProvider(data: FormData) {

        try {
            const response = await this.api.post(`${baseUrl}/client/add-existing-client-to-provider`, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error: unknown) {

            if (isAxiosError(error) && error.response?.data?.data?.error) {
                toast.error(error.response.data.data.error);
            } else {
                toast.error("An unexpected error occurred");
            }

            throw error || "Adding client has failed";
        }
    }

    async updateExistingClientApi(data: ClientType) {

        try {
            const response = await this.api.patch(`${API_BASE_URL}/client/update-existing-client`, data);
            return response.data;
        } catch (error: unknown) {

            throw error || "Sign up failed";

        }
    }
    async searchUsers(query: string) {
        try {
            const response = await this.api.get(`${getApiBaseUrl()}/auth/search-users?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to search users";
            toast.error(errMsg);
            return { data: { users: [] } };
        }
    }
}

const clientApiService = new ClientApiService()
export default clientApiService