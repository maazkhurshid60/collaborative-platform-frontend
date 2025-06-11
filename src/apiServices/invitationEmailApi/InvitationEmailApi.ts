import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { isAxiosError } from "axios";
interface InvitationEmailApiServiceType {
    invitationEmail: string, providerName: string
}

class InvitationEmailApiService {
    private api = axiosInstance



    async sendInvitationEmailApiService(data: InvitationEmailApiServiceType) {
        try {
            const response = await this.api.post("/invite/invite-someone", data);
            return response.data;
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.data?.data?.error) {
                toast.error(error.response.data.data.error);
            } else {
                toast.error("An unexpected error occurred");
            }

            throw error || "Sending invitation email has failed";
        }
    }


}

const invitationEmailApiService = new InvitationEmailApiService()
export default invitationEmailApiService