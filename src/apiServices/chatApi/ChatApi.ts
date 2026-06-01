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

    async getAllUsersForChat(loginUserId: string) {
        try {
            const response = await this.api.post("/chat-channel/get-all-users", { loginUserId });
            return response?.data;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get users";
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

    /**
     * Direct-add of existing platform providers to an existing group chat —
     * no email invite, no token. Used by the AddMembersToGroupModal.
     *
     * `providerIds` are Provider record ids (the same ids used by createGroup).
     * Returns the response payload so callers can craft a friendly toast that
     * names the providers that were actually added.
     */
    async addProvidersToGroup(data: { groupId: string; providerIds: string[] }) {
        try {
            const response = await this.api.patch("/chat-group/add-members", data);
            return response?.data;
        } catch (error) {
            // Caller (the modal) owns the error toast so it can build a
            // message that lists providers by name. We just rethrow.
            throw error;
        }
    }

    /**
     * Toggle the per-group "members can invite" permission. Only the creator
     * may call this; backend will return 403 for anyone else.
     */
    async updateGroupPermissions(data: { groupId: string; membersCanInvite: boolean }) {
        try {
            const response = await this.api.patch("/chat-group/permissions", data);
            return response?.data;
        } catch (error) {
            throw error;
        }
    }


}



const chatApiService = new ChatApiService()
export default chatApiService