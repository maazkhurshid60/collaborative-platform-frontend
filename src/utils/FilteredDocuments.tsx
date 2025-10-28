// import { DocumentType } from "../types/documentType/DocumentType";

// export const filterDocuments = (documents: DocumentType[], searchTerm: string): DocumentType[] => {
//     if (!searchTerm) return documents;

//     const lowerSearch = searchTerm?.toLowerCase();

//     return documents?.filter((doc) => {
//         const isStatusMatch =
//             (lowerSearch === "completed" && doc?.isAgree === true) ||
//             (lowerSearch === "pending" && doc?.isAgree === false);

//         return (
//             doc?.name?.toLowerCase().includes(lowerSearch) ||
//             doc?.document?.name?.toLowerCase().includes(lowerSearch) ||
//             doc?.document?.type?.toLowerCase().includes(lowerSearch) ||
//             doc?.provider?.user?.fullName?.toLowerCase().includes(lowerSearch) ||
//             doc?.type?.toLowerCase().includes(lowerSearch) ||

//             doc?.createdAt?.split("T")[0]?.includes(lowerSearch) ||
//             doc?.document?.createdAt?.split("T")[0]?.includes(lowerSearch) ||
//             isStatusMatch
//         );
//     });
// };


import { DocumentType } from "../types/documentType/DocumentType";

export const filterDocuments = (documents: DocumentType[], searchTerm: string): DocumentType[] => {
    if (!searchTerm) return documents;

    const lowerSearch = searchTerm.toLowerCase();

    return documents?.filter((doc) => {
        const isStatusMatch =
            (lowerSearch === "completed" && doc?.isAgree === true) ||
            (lowerSearch === "pending" && doc?.isAgree === false);

        return (
            doc?.name?.toLowerCase().includes(lowerSearch) ||
            doc?.document?.name?.toLowerCase().includes(lowerSearch) ||
            doc?.document?.type?.toLowerCase().includes(lowerSearch) ||
            doc?.provider?.user?.fullName?.toLowerCase().includes(lowerSearch) ||
            doc?.type?.toLowerCase().includes(lowerSearch) ||
            doc?.createdAt?.split("T")[0]?.includes(lowerSearch) ||
            doc?.document?.createdAt?.split("T")[0]?.includes(lowerSearch) ||
            isStatusMatch
        );
    });
};
