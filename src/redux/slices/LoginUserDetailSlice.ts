import { createSlice } from "@reduxjs/toolkit";




const initialState = {
    searchByLicenseNo: "",
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
            updatedAt: ""
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
        isAccountCreatedByOwnClient: true
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
                isAccountCreatedByOwnClient: true
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
                    updatedAt: ""
                }
            }
        }
    }


})
export const { saveLoginUserDetailsReducer, updateBlockedMembers, saveLicenseNoResult, emptyResult, searchByLicenseNoReducer } = LoginUserDetail.actions
export default LoginUserDetail.reducer