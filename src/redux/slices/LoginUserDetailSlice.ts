import { createSlice } from "@reduxjs/toolkit";




const initialState = {
    searchByCNIC: "",
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
            cnic: "",
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
        searchByCNICReducer: (state, action) => {
            state.searchByCNIC = action.payload
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
                userId: "",
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
                    profileImage: "",
                    role: "",
                    status: null,
                    updatedAt: ""
                }
            }
        }
    }


})
export const { saveLoginUserDetailsReducer, updateBlockedMembers, saveCNICResult, emptyResult, searchByCNICReducer } = LoginUserDetail.actions
export default LoginUserDetail.reducer