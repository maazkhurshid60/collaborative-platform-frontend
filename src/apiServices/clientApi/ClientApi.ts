import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { ClientType } from "../../types/clientType/ClientType";

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
    async deleteClientApi(clientId: string) {
        try {

            const response = await this.api.delete("/client/delete-client", { data: { clientId } })
            return response?.data
        } catch (error) {
            console.log(error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async updateClientApi(data: ClientType) {

        try {
            const response = await this.api.patch("/client/update-client", data);
            return response.data;
        } catch (error: unknown) {
            console.log(error);


            throw error || "Update the client failed";

        }
    }


    async addClientApi(data: ClientType) {

        try {
            const response = await this.api.post("/client/add-client", data);
            return response.data;
        } catch (error: unknown) {
            console.log(error);
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