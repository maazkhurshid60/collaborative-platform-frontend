import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { documentSharedWithClientType } from "../../types/documentType/DocumentType";
import axios from "axios"; // make sure this is imported

class DocumentApiService {
    private api = axiosInstance
    async getAllDocuments(clientId: string) {
        try {
            const response = await this.api.post("/document/get-all-document", { clientId }); // prepend /provider here
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
    async documentSignByClientApi(formData: FormData) {
        try {
            const response = await this.api.patch("/document/document-sign-by-client", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response?.data;
        } catch (error: unknown) {
            let errMsg = "Something went wrong";

            if (axios.isAxiosError(error)) {
                errMsg = error.response?.data?.error || "Failed to share document";
            }

            toast.error(errMsg);
        }
    }
}

const documentApiService = new DocumentApiService()
export default documentApiService