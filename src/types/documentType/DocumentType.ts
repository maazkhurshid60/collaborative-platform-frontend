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
    pdfUrl?: string
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

// ----- Provider-side "Document Sharing" tab -----

/** A single share-row from `DocumentShareWith`, joined into a master document. */
export interface DocumentShareRow {
    id: string;
    documentId: string;
    clientId: string | null;
    providerId: string | null;
    eSignature: string | null;
    isAgree: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Master document with its share rows joined in.
 * When the request is provider-scoped, `sharedWith` only contains rows
 * belonging to that provider — making per-(doc, client) status easy to derive.
 */
export interface MasterDocument {
    id: string;
    name: string;
    url: string;
    type?: string | null;
    createdAt: string;
    updatedAt: string;
    sharedWith: DocumentShareRow[];
    isForm?: boolean;
    shares?: any[];
}

/** Per-(document, client) status used by the multi-client share modal. */
export type DocClientStatus = 'NEED_SHARE' | 'SHARED' | 'SIGNED';

/** A flattened recipient row returned by `GET /document/:id/recipients`. */
export interface DocumentRecipient {
    id: string;
    clientId: string;
    fullName: string;
    email: string | null;
    isSigned: boolean;
    eSignature: string | null;
    updatedAt: string;
}

export interface DocumentRecipientsResponse {
    recipients: DocumentRecipient[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
