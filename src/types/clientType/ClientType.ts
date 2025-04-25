import { ProviderType } from "../providerType/ProviderType"

export interface ClientType {
    id?: string
    email?: string
    password?: string
    userId?: string
    createdAt?: string
    updatedAt?: string
    user?: User
    sharedDocument?: []
    providerList?: Provider[]
    providerId?: string

}


export interface Provider {
    clientId?: string

    createdAt?: string
    providerId?: string
    updatedAt?: string
    id?: string
    provider: ProviderType

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
    cnic?: string
    role?: string
    blockedMembers?: string
    createdAt?: string
    updatedAt?: string
}