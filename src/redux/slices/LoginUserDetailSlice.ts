import { createSlice } from "@reduxjs/toolkit";




const initialState = {
    searchByLicenseNo: "",
    decryptedPrivateKey: null as Uint8Array | null,
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
        userId: "",
        user: {
            address: null,
            age: null,
            blockedMembers: [] as string[],
            licenseNo: "",
            contactNo: null,
            createdAt: "",
            fullName: "",
            gender: null,
            id: "",
            profileImage: "",
            role: "",
            status: null,
            updatedAt: "",
            isApprove: false
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
        isApprove: false,
        state: "",
        country: ""
    }
}

const LoginUserDetail = createSlice({
    name: "LoginUserDetail",
    initialState: initialState,
    reducers: {
        saveLoginUserDetailsReducer: ((state, action) => {
            state.userDetails = action.payload

        }),
        updateBlockedMembers: (state, action) => {
            state.userDetails.user.blockedMembers = action.payload;
        },
        saveLicenseNoResult: (state, action) => {
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
                isApprove: false,
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
                userId: "",
                user: {
                    address: null,
                    age: null,
                    blockedMembers: [] as string[],
                    licenseNo: "",
                    contactNo: null,
                    createdAt: "",
                    fullName: "",
                    gender: null,
                    id: "",
                    profileImage: "",
                    role: "",
                    status: null,
                    updatedAt: "",
                    isApprove: false
                }
            }
            state.decryptedPrivateKey = null;
        },
        saveDecryptedPrivateKey: (state, action) => {
            state.decryptedPrivateKey = action.payload;
        }
    }


})
export const { saveLoginUserDetailsReducer, updateBlockedMembers, saveLicenseNoResult, emptyResult, searchByLicenseNoReducer
    , saveDecryptedPrivateKey
} = LoginUserDetail.actions
export default LoginUserDetail.reducer