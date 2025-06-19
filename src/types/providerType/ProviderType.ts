import { ClientType } from "../clientType/ClientType"

export interface ProviderType {
    id?: string
    email?: string
    password?: string
    userId?: string
    department?: string
    createdAt?: string
    updatedAt?: string
    user?: User
    sharedDocument?: []
    clientList?: Client[]
    // provider?:
    clientId?: string
    client?: ClientType
}
export interface Client {
    id?: string
    client?: { user?: { fullName?: string } }
}

export interface User {
    id?: string
    fullName?: string
    profileImage?: string | null
    gender?: string | null
    age?: string | null
    contactNo?: string | null
    address?: string | null
    status?: string | null
    licenseNo?: string
    role?: string
    blockedMembers?: string
    createdAt?: string
    updatedAt?: string
}