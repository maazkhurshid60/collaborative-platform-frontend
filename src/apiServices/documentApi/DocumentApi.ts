import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { documentSharedWithClientType } from "../../types/documentType/DocumentType";
import axios from "axios"; // make sure this is imported

class DocumentApiService {
    private api = axiosInstance
    async getAllDocuments(clientId: string) {
        try {
            const response = await this.api.post("/document/get-all-document", { clientId });
            return response?.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total provider";
            toast.error(errMsg);
        }
    }
    async getAllSharedDocumentWithClientApi(clientId: string) {
        try {
            const response = await this.api.post("/document/get-all-shared-document", { clientId }); // prepend /provider here
            return response?.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total provider";
            toast.error(errMsg);
        }
    }
    async documentSharedWithClientApi(data: documentSharedWithClientType) {
        try {
            const response = await this.api.post("/document/document-shared-by-provider", data); // prepend /provider here
            toast.success(`${response?.data?.data?.message}`)
            return response?.data;
        } catch (error: unknown) {
            let errMsg = "Something went wrong";

            if (axios.isAxiosError(error)) {
                errMsg = error.response?.data?.error || "Failed to share document";
            }

            toast.error(errMsg);
        }
    }
    async documentSignByClientApi(formData: {
        isAgree: boolean;
        eSignature: string;
        clientId?: string;
        sharedDocumentId?: string;
        senderId?: string;
    }) {
        try {
            const response = await this.api.patch("/document/document-sign-by-client", formData);

            return response?.data;
        } catch (error: unknown) {
            console.log("ERROR", error);

            let errMsg = "Something went wrong";

            if (axios.isAxiosError(error)) {
                errMsg = error.response?.data?.error || "Failed to share document";
            }

            toast.error(errMsg);
        }
    }
    async addDocumentApi(formData: FormData) {
        try {
            const response = await this.api.post("/document/create-document", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                validateStatus: () => true // prevent axios from throwing automatically
            });

            // If not 201, treat it as an error
            if (response.status !== 201) {
                throw new Error(response?.data?.error || "Failed to add document");
            }

            return response?.data;
        } catch (error: unknown) {
            let errMsg = "Something went wrong";

            if (axios.isAxiosError(error)) {
                errMsg = error.response?.data?.error || "Failed to add document";
            } else if (error instanceof Error) {
                errMsg = error.message;
            }

            toast.error(errMsg);
            throw new Error(errMsg); // 💥 force trigger onError in useMutation
        }
    }

    async deleteDocumentApi(id: string) {
        try {
            const response = await this.api.delete(
                "/document/delete-document",
                { data: { id } }
            );

            return response?.data;
        } catch (error: unknown) {
            let errMsg = "Something went wrong";

            if (axios.isAxiosError(error)) {
                errMsg = error.response?.data?.error || "Failed to add document";
            }

            toast.error(errMsg);
        }
    }
}

const documentApiService = new DocumentApiService()
export default documentApiService