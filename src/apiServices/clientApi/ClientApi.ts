import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { ClientType } from "../../types/clientType/ClientType";
import { isAxiosError } from "axios";
import { selectedClientIdType } from "../../pages/providerPages/clients/Clients";

class ClientApiService {
    private api = axiosInstance

    async getAllTotalClient() {
        try {

            const response = await this.api.get("/client/get-total-clients")
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    async getAllClient(loginUserId: string) {
        try {

            const response = await this.api.post("/client/get-all-clients", { loginUserId })
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async deleteClientApi(data: selectedClientIdType) {
        try {

            const response = await this.api.delete("/client/delete-client", { data: { clientId: data?.clientId, providerId: data?.providerId } })
            return response?.data
        } catch (error) {
            console.log(error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async updateClientApi(data: FormData) {

        try {
            const response = await this.api.patch("/client/update-client", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error: unknown) {
            console.log(error);


            throw error || "Update the client failed";

        }
    }

    async addClientApi(data: FormData) {
        try {
            const response = await this.api.post("/client/add-client", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error: unknown) {
            console.log("errors", error);

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
            const response = await this.api.patch("/client/update-existing-client", data);
            return response.data;
        } catch (error: unknown) {
            console.log(error);
            throw error || "Sign up failed";

        }
    }
}

const clientApiService = new ClientApiService()
export default clientApiService