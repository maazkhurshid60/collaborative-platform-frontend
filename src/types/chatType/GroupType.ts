import { LastMessage } from "./ChatChannelType";

// The user profile nested under a Provider
export interface UserProfile {
    id: string;
    fullName: string;
    address: string;
    age: number;
    gender: string;
    licenseNo: string;
    contactNo: string;
    profileImage: string | null;
    role: string;
    status: string;
    blockedMembers: string[];      // adjust if you know the exact type
    createdAt: string;
    updatedAt: string;
}

// A provider in your system
export interface Provider {
    id: string;
    email: string;
    password: string;
    department: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: UserProfile;
}

// A member of a group‐chat, linking a Provider to a GroupChat
export interface GroupMember {
    id: string;              // the join‐record id
    groupChatId: string;
    providerId: string;
    Provider: Provider;      // the actual provider data
    user: UserProfile;
}

// Your top‐level group chat object
export interface GroupChat {
    id: string;
    name: string;
    members: GroupMember[];
    providerAId: string;
    providerBId: string;
    providerA: Provider;
    providerB: Provider;
    lastMessage?: LastMessage
    unreadCount?: number
    updatedAt?: string

}
