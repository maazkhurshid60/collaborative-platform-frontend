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
        user: {
            address: null,
            age: null,
            blockedMembers: [],
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

const LoginUserDetail = createSlice({
    name: "LoginUserDetail",
    initialState: initialState,
    reducers: {
        saveLoginUserDetailsReducer: ((state, action) => {
            state.userDetails = action.payload
        })
    }

})
export const { saveLoginUserDetailsReducer } = LoginUserDetail.actions
export default LoginUserDetail.reducer