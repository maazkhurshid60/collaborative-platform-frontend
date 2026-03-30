import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    address: string | null;
    age: string | null;
    blockedMembers: string[];
    licenseNo: string;
    contactNo: string | null;
    createdAt: string;
    fullName: string;
    gender: string | null;
    email: string | null;
    id: string;
    profileImage: string;
    role: string;
    status: string | null;
    updatedAt: string;
    isApprove: string;
    isEmailVerified?: boolean;
    hasUsedFreeTrial?: boolean;
    subscription?: {
        id: string;
        plan: 'STANDARD' | 'PRO';
        status: 'TRIALING' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAUSED';
        trialStart?: string;
        trialEnd?: string;
        currentPeriodEnd?: string;
        cancelAtPeriodEnd: boolean;
        billingCycle?: string;
    };
}

export interface UserDetails {
    createAt: string;
    eSignature: any;
    email: string;
    id: string;
    isAccountCreatedByOwnClient: boolean;
    password: string;
    updatedAt: string;
    department: string;
    clientList: any[];
    providerList: any[];
    userId: string;
    user: User;
}

interface LicenseNoResult {
    email: string;
    licenseNo: string;
    fullName: string;
    clientId: string;
    gender: string | null;
    age: string | null;
    contactNo: string | null;
    address: string | null;
    status: string | null;
    isClientExist: boolean;
    isAccountCreatedByOwnClient: boolean;
    isApprove: string;
    state: string;
    country: string;
}

interface LoginUserDetailState {
    searchByLicenseNo: string;
    decryptedPrivateKey: Uint8Array | null;
    userDetails: UserDetails;
    licenseNoResult: LicenseNoResult;
    isRefreshing: boolean;
}

const initialState: LoginUserDetailState = {
    searchByLicenseNo: "",
    decryptedPrivateKey: null,
    userDetails: {
        createAt: "",
        eSignature: null,
        email: "",
        id: "",
        isAccountCreatedByOwnClient: false,
        password: "",
        updatedAt: "",
        department: "",
        clientList: [],
        providerList: [],
        userId: "",
        user: {
            address: null,
            age: null,
            blockedMembers: [],
            licenseNo: "",
            contactNo: null,
            createdAt: "",
            fullName: "",
            email: null,
            gender: null,
            id: "",
            profileImage: "",
            role: "",
            status: null,
            updatedAt: "",
            isApprove: "",
            isEmailVerified: false
        }
    },
    licenseNoResult: {
        email: "",
        licenseNo: "",
        fullName: "",
        clientId: "",
        gender: null,
        age: null,
        contactNo: null,
        address: null,
        status: null,
        isClientExist: false,
        isAccountCreatedByOwnClient: true,
        isApprove: "",
        state: "",
        country: ""
    },
    isRefreshing: false
}

const LoginUserDetail = createSlice({
    name: "LoginUserDetail",
    initialState: initialState,
    reducers: {
        saveLoginUserDetailsReducer: ((state, action: PayloadAction<UserDetails>) => {
            state.userDetails = action.payload

        }),
        updateBlockedMembers: (state, action) => {
            state.userDetails.user.blockedMembers = action.payload;
        },
        saveLicenseNoResult: (state, action: PayloadAction<LicenseNoResult>) => {
            state.licenseNoResult = action.payload;
        },
        searchByLicenseNoReducer: (state, action) => {
            state.searchByLicenseNo = action.payload
        },
        emptyResult: (state) => {
            state.licenseNoResult = {
                email: "",
                licenseNo: "",
                fullName: "",
                clientId: "",
                gender: null,
                age: null,
                contactNo: null,
                address: null,
                status: null,
                isClientExist: false,
                isAccountCreatedByOwnClient: true,
                isApprove: "",
                state: "",
                country: ""
            }
            state.userDetails = {
                createAt: "",
                eSignature: null,
                email: "",
                id: "",
                isAccountCreatedByOwnClient: false,
                password: "",
                updatedAt: "",
                department: "",
                clientList: [],
                providerList: [],
                userId: "",
                user: {
                    address: null,
                    age: null,
                    blockedMembers: [],
                    licenseNo: '',
                    contactNo: null,
                    createdAt: "",
                    fullName: "",
                    email: "",
                    gender: null,
                    id: "",
                    profileImage: "",
                    role: "",
                    status: null,
                    updatedAt: "",
                    isApprove: "",
                    isEmailVerified: false
                }
            }
            state.decryptedPrivateKey = null;
        },
        saveDecryptedPrivateKey: (state, action) => {
            state.decryptedPrivateKey = action.payload;
        },
        setIsRefreshing: (state, action: PayloadAction<boolean>) => {
            state.isRefreshing = action.payload;
        },
        setEmailVerified: (state, action: PayloadAction<boolean>) => {
            if (state.userDetails.user) {
                state.userDetails.user.isEmailVerified = action.payload;
            }
        }
    }


})
export const { saveLoginUserDetailsReducer, updateBlockedMembers, saveLicenseNoResult, emptyResult, searchByLicenseNoReducer
    , saveDecryptedPrivateKey, setIsRefreshing, setEmailVerified
} = LoginUserDetail.actions
export default LoginUserDetail.reducer