import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance/AxiosInstance"
interface getAllMessagesOfSingleChatChannelType {
    chatChannelId: string
    loginUserId: string
}
interface sendMessageToSingleConservation {
    chatChannelId: string
    senderId: string
    message?: string
    mediaUrl?: string
    type?: string
}
class MessageApiService {
    private api = axiosInstance
    async getAllMessagesOfSingleChatChannel(data: getAllMessagesOfSingleChatChannelType) {
        try {

            const response = await this.api.post("/chat/single-chat/all-messages", data)
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

}

const messageApiService = new MessageApiService()

export default messageApiService