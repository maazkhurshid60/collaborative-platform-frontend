import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isModalShow: false,
    isModalDelete: false,
    isNewChatModal: false,
    isNewGroupChatModal: false

}
const modalSlice = createSlice({
    name: "modal",

    initialState: initialState,
    reducers: {
        isModalShowReducser: ((state, action) => {


            state.isModalShow = action.payload
        }),
        isNewChatModalShowReducser: ((state, action) => {


            state.isNewChatModal = action.payload
        }),
        isNewGroupChatModalShowReducser: ((state, action) => {


            state.isNewGroupChatModal = action.payload
        }),
        isModalDeleteReducer: ((state, action) => {


            state.isModalDelete = action.payload
        }),

    }
})
export const { isModalShowReducser, isModalDeleteReducer, isNewChatModalShowReducser, isNewGroupChatModalShowReducser } = modalSlice.actions
export default modalSlice.reducer