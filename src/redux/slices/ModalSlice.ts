import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isModalShow: false,
    isModalDelete: false,

}
const modalSlice = createSlice({
    name: "modal",

    initialState: initialState,
    reducers: {
        isModalShowReducser: ((state, action) => {


            state.isModalShow = action.payload
        }),
        isModalDeleteReducer: ((state, action) => {


            state.isModalDelete = action.payload
        }),

    }
})
export const { isModalShowReducser, isModalDeleteReducer } = modalSlice.actions
export default modalSlice.reducer