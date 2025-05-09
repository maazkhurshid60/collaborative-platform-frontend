import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";

interface createChatChannel {
    providerId?: string
    toProviderId?: string
    groupName?: string
    membersId?: string[]
}

class ChatApiService {
    private api = axiosInstance
    //SINGLE CONSERVATION APIS
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

    //GROUP CHATS APIS
    async createGroupChatChannels(data: createChatChannel) {
        try {

            const response = await this.api.post("/chat-group/create-group", data)
            toast.success(response?.data?.message)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async getGroupChatChannels(loginUserId: string) {
        try {

            const response = await this.api.post("/chat-group/get-all-group",
                { loginUserId })
            // toast.success(response?.data?.message)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }


}



const chatApiService = new ChatApiService()
export default chatApiService