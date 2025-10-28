import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
import { GroupDelete } from "../../types/chatType/GroupType";
import axios from "axios";

interface createChatChannel {
    providerId?: string
    toProviderId?: string

}

interface CreateGroupChannel {

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
    async deleteChatChannels(id: string) {
        try {

            const response = await this.api.delete("/chat-channel/delete-chat-channel", { data: { id } })
            return response?.data
        } catch (error) {
            console.error("error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    //GROUP CHATS APIS
    async createGroupChatChannels(data: CreateGroupChannel) {
        try {

            const response = await this.api.post("/chat-group/create-group", data)
            toast.success(response?.data?.message)
            return response?.data
        } catch (error) {

            let errMsg = "Failed to create group";
            if (axios.isAxiosError(error) && error.response) {
                errMsg = error.response.data?.message || errMsg;
            }
            console.error(errMsg);
            throw error;
        }
    }
    async getGroupChatChannels(loginUserId: string) {
        try {

            const response = await this.api.post("/chat-group/get-all-group",
                { loginUserId })
            return response?.data
        } catch (error) {
            console.log("getGroupChatChannels ERROR", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    async deleteGroupChannels(data: GroupDelete) {

        try {

            const response = await this.api.delete("/chat-group/delete-group-message", { data })
            return response?.data
        } catch (error) {
            console.error("error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }


}



const chatApiService = new ChatApiService()
export default chatApiService