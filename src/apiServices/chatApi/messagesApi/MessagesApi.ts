import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance/AxiosInstance"
interface getAllMessagesOfSingleChatChannelType {
    chatChannelId?: string
    groupId?: string
    loginUserId?: string
}
interface getAllMessagesOfSingleChat {
    chatChannelId: string
    page: number | string
    limit: number | string
    loginUserId?: string
}


export interface ReadMessageSingleConservationPayload {
    loginUserId: string;
    chatChannelId?: string;
    groupId?: string
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
    async getAllMessagesOfSingleChat(data: getAllMessagesOfSingleChat) {
        try {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>", data);

            const response = await this.api.post("/chat/single-chat/get-all-message", data)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }

    async sendMessageToSingleConservation(data: FormData) {
        try {

            const response = await this.api.post("/chat/single-chat/sent-message", data)


            return response?.data


        } catch (error) {
            console.log("aaaaaaaaaaa", error);

            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }


    async readMessageSingleConservation(data: ReadMessageSingleConservationPayload) {
        try {

            const response = await this.api.post("/chat/single-chat/read-message", data)

            return response?.data


        } catch (error) {


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
    async sendMessagesOfGroupChatChannel(data: FormData) {
        try {

            const response = await this.api.post("/chat-group/send-message-to-group", data)
            return response?.data


        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }



    async readMessageGroupConservation(data: ReadMessageSingleConservationPayload) {
        try {

            const response = await this.api.post("/chat-group/read-message", data)

            return response?.data


        } catch (error) {


            const errMsg = error instanceof Error ? error.message : "Failed to get total client";
            toast.error(errMsg);
        }
    }
}

const messageApiService = new MessageApiService()

export default messageApiService