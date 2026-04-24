export interface DocumentResponseType {
    completedDocuments: Document[];
    uncompletedDocuments: Document[];
    sharedDocuments: Document[];
};

export interface DocumentType {
    id: string;
    clientId: string;
    providerId: string;
    documentId: string;
    eSignature: string;
    isAgree: boolean;
    createdAt: string;
    updatedAt: string;
    document?: DocumentFile;
    provider: Provider;
    type?: string,
    name?: string,
    url?: string
}

export interface DocumentFile {
    id?: string;
    name?: string;
    url?: string;
    type?: string
    createdAt?: string;
    updatedAt?: string;
}

export interface Provider {
    id: string;
    speciality: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: User;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    licenseNo: string;
    age: number;
    gender: string;
    contactNo: string;
    address: string;
    role: string;
    status: string;
    profileImage: string | null;
    blockedMembers: string[];
    createdAt: string;
    updatedAt: string;
}


export interface Document {
    id: string,
    url: string,
    name: string,
    createdAt: string,
    updatedAt: string
    sharedWith: [
        {
            id: string,
            eSignature: string | null,
            isAgree: boolean,
            clientId: string,
            providerId: string,
            documentId: string,
            createdAt: string,
            updatedAt: string
        }
    ]
}



export interface documentSharedWithClientType {
    providerId?: string, clientId?: string, documentId: string[]
}
export interface documentSignByClientType {
    clientId: string, sharedDocumentId: string, eSignature: string, isAgree?: boolean, documentId: string
    recipientId: string,
    providerId: string
    senderId: string
}


export interface DocModalData {
    clientId: string;
    providerId: string;
    documentId: string;
    sharedDocumentId?: string;
    eSignature?: string;
    isAgree?: boolean;
    recipientId: string
}
