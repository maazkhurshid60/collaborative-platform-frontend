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
    age?: number | string
    eSignature?: string

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





export interface GetMeType {
    createdAt: string;
    eSignature: string | null | undefined;
    email: string;
    id: string;
    isAccountCreatedByOwnClient: boolean;
    password: string;
    updatedAt: string;
    userId: string;
    user: {
        address: string;
        age: number;
        blockedMembers: string[]; // or a specific type if you know the structure
        cnic: string;
        contactNo: string;
        createdAt: string;
        fullName: string;
        gender: string; // update enum if needed
        id: string;
        profileImage: string | null;
        role: string; // add more roles if needed
        status: string; // define based on your app
        updatedAt: string;
    };
}
