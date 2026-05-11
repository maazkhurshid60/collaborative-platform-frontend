import axios, { AxiosInstance } from "axios";
import { baseUrl } from "../baseUrl/BaseUrl";

class SuperAdminApi {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: `${baseUrl}/super-admin`,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async getAllPayments() {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get("/payments/all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching all payments:", error);
            throw error;
        }
    }

    async getAllSubscriptions() {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get("/subscriptions/all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching all subscriptions:", error);
            throw error;
        }
    }

    async updateSubscription(id: string, data: any) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.put(`/subscriptions/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error updating subscription:", error);
            throw error;
        }
    }

    async deleteSubscription(id: string) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.delete(`/subscriptions/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error deleting subscription:", error);
            throw error;
        }
    }

    async getProviderContactInfo(userId: string) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get(`/provider/${userId}/contact-info`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching provider contact info:", error);
            throw error;
        }
    }

    async getProviderSubscriptionInfo(userId: string) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get(`/provider/${userId}/subscription-info`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching provider subscription info:", error);
            throw error;
        }
    }

    async getProviderPaymentHistory(userId: string) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get(`/provider/${userId}/payment-history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching provider payment history:", error);
            throw error;
        }
    }

    async getAllAuditLogs(params: any = {}) {
        try {
            const token = localStorage.getItem("token");
            const response = await this.api.get("/audit-logs/all", {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching all audit logs:", error);
            throw error;
        }
    }
}

const superAdminApi = new SuperAdminApi();
export default superAdminApi;
