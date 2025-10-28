import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance/AxiosInstance"
import { AxiosError } from "axios";
interface getAllMessagesOfSingleChatChannelType {
    chatChannelId?: string
    groupId?: string
    loginUserId?: string
}

export interface updateGroupApiType {
    groupId?: string
    memberEmail?: string
}

export interface getAllMessagesOfSingleChat {
    chatChannelId?: string
    groupId?: string
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
            console.log("eeor", error);

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

    async updateGroupApi(data: updateGroupApiType) {
        try {

            const response = await this.api.patch("/chat-group/update-group", data)
            return response?.data


        } catch (error: unknown) {
            const err = error as AxiosError<{ data: { message: string } }>;

            console.log("ERROR", err?.response?.data?.data?.message);

            throw err?.response?.data?.data?.message || "Failed to join chat";
        }
    }
    async getAllMessagesOfGroupChatChannel(data: getAllMessagesOfSingleChat) {
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