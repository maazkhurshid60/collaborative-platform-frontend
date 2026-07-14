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
    senderId?: string
    isGroupMessage?: boolean | undefined
    groupId: string
    mediaUrl?: string
    type?: string
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
        fullName: string;
        profileImage: string | null;
    };
}