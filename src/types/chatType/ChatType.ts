import { ProviderType } from "../providerType/ProviderType"

export interface Group {
    id?: string
    members?: ProviderType[]
}
export interface NewMessage {
    chatChannelId?: string
    id?: string
    message?: string
    createdAt?: string
    updatedAt?: string
}

export interface LastMessage {
    createdAt: string
    updatedAt?: string
    id: string
    message: string
    senderId: string
}

export interface Message {
    id: string;
    message: string;
    type: string;
    mediaUrl: string;
    chatChannelId: string;
    groupId: string | null;
    senderId: string;
    createdAt: string;
    readStatus: 'read' | 'unread';
    readReceipts: string[]; // Define more precisely if needed

    sender: {
        id: string;
        email: string;
        password: string;
        department: string;
        createdAt: string;
        updatedAt: string;
        userId: string;

        user: {
            id: string;
            fullName: string;
            age: number;
            gender: string;
            licenseNo: string;
            contactNo: string;
            address: string;
            role: string;
            status: string;
            profileImage: string | null;
            createdAt: string;
            updatedAt: string;
            blockedMembers: string[]; // Define type if available
        };
    };
}