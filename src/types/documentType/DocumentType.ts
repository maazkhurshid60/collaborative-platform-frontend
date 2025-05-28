export interface DocumentResponseType {
    completedDocuments: Document[];
    uncompletedDocuments: Document[];
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
    email: string;
    password: string;
    department: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: User;
}

export interface User {
    id: string;
    fullName: string;
    cnic: string;
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
    sharedRecord: [
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
