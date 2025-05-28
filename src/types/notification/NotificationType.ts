import { User } from "../clientType/ClientType"
import { User as Provider } from "../providerType/ProviderType"

export interface NotificationType {
    id: string,
    createdAt: string
    message: string
    recipientId: string
    recipient: User
    sender: User
    seen: boolean
    title: string
    type: string
    user: User | Provider
}