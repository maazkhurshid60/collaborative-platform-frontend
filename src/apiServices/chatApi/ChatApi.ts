import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";

interface createChatChannel {
    providerId?: string
    toProviderId?: string
}

class ChatApiService {
    private api = axiosInstance
    async getAllChatChannels(loginUserId: string) {
        try {
            // send the correct key
            const response = await this.api.post(
                "/chat-channel/get-all-chat-channel",
                { loginUserId }
            );
            return response.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get chat channels";
            toast.error(errMsg);
        }
    }

    async createChatChannels(data: createChatChannel) {
        try {

            const response = await this.api.post("/chat-channel/create-chat-channel", data)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }


}



const chatApiService = new ChatApiService()
export default chatApiService