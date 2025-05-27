import { toast } from "react-toastify";
import axiosInstance from "../axiosInstance/AxiosInstance";
interface NotificationData {
    recipientId: string, // userId of client
    title: string,
    type: string
}
class NotificationServiceApi {
    private api = axiosInstance

    async getAllNotification() {
        try {

            const response = await this.api.get("/notification/get-notification")
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get allnotification";
            toast.error(errMsg);
        }
    }

    async sendNotification(data: NotificationData) {
        try {

            const response = await this.api.post("/notification/send-notification", data)
            return response?.data
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to get allnotification";
            toast.error(errMsg);
        }
    }
}

const notificationApiService = new NotificationServiceApi()
export default notificationApiService