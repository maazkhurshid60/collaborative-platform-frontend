export interface ChatChannelType {
    id: string;
    createdAt: string;
    updatedAt: string;
    providerAId: string;
    providerBId: string;
    providerA: Provider;
    providerB: Provider;
    totalUnread?: string | number
    name?: string
    members?: Member[]
    lastMessage?: LastMessage
    unreadCount?: number | string
    isPinned?: boolean
}

export interface LastMessage {
    message?: string
    createdAt: string
    mediaUrl?: string
    type?: string
    id?: string
}

export interface Member {
    id: string;
    user: {
        fullName: string;

    };
}

export interface Provider {
    id: string;
    fullName: string;
    profileImage?: string | null;
}

export interface ProviderUser {
    id: string;
    fullName: string;
    gender: string;
    age: number | null;
    address: string | null;
    contactNo: string | null;
    licenseNo: string;
    profileImage: string | null;
    email?: string
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    blockedMembers: string[]; // You can replace `any` with a specific type if available
}



