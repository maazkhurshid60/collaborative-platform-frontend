import { ProviderUser } from "../chatType/ChatChannelType"
import { ClientType } from "../clientType/ClientType"

export interface ProviderType {
    id?: string
    email?: string
    password?: string
    userId?: string
    specialty?: string
    createdAt?: string
    updatedAt?: string
    user?: any
    sharedDocument?: []
    clientList?: Client[]
    // provider?:
    clientId?: string
    client?: ClientType
}
export interface Client {
    id?: string
    clientId?: string
    client?: { clientShowToOthers: boolean, user?: { fullName?: string } }
    email?: string
}

export interface User {
    id?: string
    isApprove?: string
    fullName?: string
    email?: string
    profileImage?: string | null
    gender?: string | null
    age?: string | null
    contactNo?: string | null
    address?: string | null
    status?: string | null
    licenseNo?: string
    role?: string
    // country: string
    state: string
    blockedMembers?: string
    createdAt?: string
    updatedAt?: string
    client?: Client
    provider?: ProviderUser
}