export interface ChatChannelType {
    id: string;
    createdAt: string;
    updatedAt: string;
    providerAId: string;
    providerBId: string;
    providerA: Provider;
    providerB: Provider;
    totalUnread?: string | number
}

export interface Provider {
    id: string;
    email: string;
    password: string;
    department: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: ProviderUser;
}

export interface ProviderUser {
    id: string;
    fullName: string;
    gender: string;
    age: number | null;
    address: string | null;
    contactNo: string | null;
    cnic: string;
    profileImage: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    blockedMembers: string[]; // You can replace `any` with a specific type if available
}
