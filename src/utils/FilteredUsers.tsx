import { ProviderType, User } from "../types/providerType/ProviderType";
import { getCountryNameFromCode } from "./GetCountryName";
import { ClientType } from '../types/clientType/ClientType';

export const filterUsers = (users: User[], searchTerm: string): User[] => {
    if (!searchTerm) return users;

    const lowerSearch = searchTerm.toLowerCase();

    return users.filter((user) => {
        const email = user.client?.email || user.provider?.email || "";
        const country = getCountryNameFromCode(user.country || "") || "";

        return (
            user.fullName?.toLowerCase().includes(lowerSearch) ||
            email.toLowerCase().includes(lowerSearch) ||
            user.state?.toLowerCase().includes(lowerSearch) ||
            country.toLowerCase().includes(lowerSearch) ||
            user.role?.toLowerCase().includes(lowerSearch) ||
            user.isApprove?.toLowerCase().includes(lowerSearch) ||
            user.licenseNo?.toLowerCase().includes(lowerSearch) ||
            user.createdAt?.split("T")[0]?.includes(lowerSearch)
        );
    });
};



export const filterProviders = (users: ProviderType[], searchTerm: string): ProviderType[] => {
    if (!searchTerm) return users;

    const lowerSearch = searchTerm.toLowerCase();

    return users.filter((user) => {
        const email = user?.email || "";
        const country = getCountryNameFromCode(user?.user?.country || "") || "";

        return (
            user?.user?.fullName?.toLowerCase().includes(lowerSearch) ||
            email.toLowerCase().includes(lowerSearch) ||
            user?.user?.gender?.toLowerCase().includes(lowerSearch) ||
            user?.user?.state?.toLowerCase().includes(lowerSearch) ||
            country.toLowerCase().includes(lowerSearch) ||
            user?.user?.role?.toLowerCase().includes(lowerSearch) ||
            user?.user?.isApprove?.toLowerCase().includes(lowerSearch) ||
            user?.user?.licenseNo?.toLowerCase().includes(lowerSearch) ||
            user.createdAt?.split("T")[0]?.includes(lowerSearch)
        );
    });
};
export const filterClients = (users: ClientType[], searchTerm: string): ClientType[] => {
    if (!searchTerm) return users;

    const lowerSearch = searchTerm.toLowerCase();

    return users.filter((user) => {
        const email = user?.email || "";
        const country = getCountryNameFromCode(user?.user?.country || "") || "";

        return (
            user?.user?.fullName?.toLowerCase().includes(lowerSearch) ||
            email.toLowerCase().includes(lowerSearch) ||
            user?.user?.gender?.toLowerCase().includes(lowerSearch) ||
            user?.user?.state?.toLowerCase().includes(lowerSearch) ||
            country.toLowerCase().includes(lowerSearch) ||
            user?.user?.role?.toLowerCase().includes(lowerSearch) ||
            user?.user?.isApprove?.toLowerCase().includes(lowerSearch) ||
            user?.user?.licenseNo?.toLowerCase().includes(lowerSearch) ||
            user.createdAt?.split("T")[0]?.includes(lowerSearch)
        );
    });
};
