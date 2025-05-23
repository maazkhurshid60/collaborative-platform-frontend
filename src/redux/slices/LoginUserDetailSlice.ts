import { createSlice } from "@reduxjs/toolkit";




const initialState = {
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
        user: {
            address: null,
            age: null,
            blockedMembers: [] as string[],
            cnic: "",
            contactNo: null,
            createdAt: "",
            fullName: "",
            gender: null,
            id: "",
            profileImage: null,
            role: "",
            status: null,
            updatedAt: ""
        }
    },
    cnicResult: {
        email: "",
        cnic: "",
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
            console.log(action.payload);

        }),
        updateBlockedMembers: (state, action) => {
            state.userDetails.user.blockedMembers = action.payload;
        },
        saveCNICResult: (state, action) => {
            state.cnicResult = action.payload;
        },
        emptyResult: (state) => {
            state.cnicResult = {
                email: "",
                cnic: "",
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
                user: {
                    address: null,
                    age: null,
                    blockedMembers: [] as string[],
                    cnic: "",
                    contactNo: null,
                    createdAt: "",
                    fullName: "",
                    gender: null,
                    id: "",
                    profileImage: null,
                    role: "",
                    status: null,
                    updatedAt: ""
                }
            }
        }
    }


})
export const { saveLoginUserDetailsReducer, updateBlockedMembers, saveCNICResult, emptyResult } = LoginUserDetail.actions
export default LoginUserDetail.reducer