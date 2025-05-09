import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance/AxiosInstance"
interface getAllMessagesOfSingleChatChannelType {
    chatChannelId?: string
    groupId?: string
    loginUserId?: string
}
interface sendMessageToSingleConservation {
    chatChannelId: string
    senderId: string
    message?: string
    mediaUrl?: string
    type?: string


}

export interface ReadMessageSingleConservationPayload {
    loginUserId: string;
    chatChannelId: string;
}

class MessageApiService {
    private api = axiosInstance
    //SINGLE CONSERVATION APIS

    async getAllMessagesOfSingleChatChannel(data: getAllMessagesOfSingleChatChannelType) {
        try {

            const response = await this.api.post("/chat/single-chat/all-messages", data)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async getAllMessagesOfSingleChat(loginUserId: string) {
        try {

            const response = await this.api.post("/chat/single-chat/get-all-message", loginUserId)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    async sendMessageToSingleConservation(data: sendMessageToSingleConservation) {
        try {

            const response = await this.api.post("/chat/single-chat/sent-message", data)
            console.log("<><><>><", response);

            return response?.data


        } catch (error) {
            console.log(":error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }


    async readMessageSingleConservation(data: ReadMessageSingleConservationPayload) {
        try {

            const response = await this.api.post("/chat/single-chat/read-message", data)
            console.log("<><><>><", response);

            return response?.data


        } catch (error) {
            console.log(":error", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    //GROUP APIS

    async getAllMessagesOfGroupChatChannel(data: getAllMessagesOfSingleChatChannelType) {
        try {

            const response = await this.api.post("/chat-group/get-group-messages", data)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
    async sendMessagesOfGroupChatChannel(data: getAllMessagesOfSingleChatChannelType) {
        try {

            const response = await this.api.post("/chat-group/send-message-to-group", data)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

}

const messageApiService = new MessageApiService()

export default messageApiService