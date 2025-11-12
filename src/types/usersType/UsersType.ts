import { ClientType } from "../clientType/ClientType"

export interface blockListDataType {
    fullName?: string
    isBlock?: boolean | string
    image?: string
    id: string
    address?: string
    age?: string | number
    blockedMembers?: string[]
    licenseNo?: string
    contactNo?: string | null
    createdAt?: string
    gender?: string
    profileImage?: string | null
    role?: string | null
    status?: string | null
    updatedAt?: string | null
    client?: ClientType | null
    user?:any;
}




