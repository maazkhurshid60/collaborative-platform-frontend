import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isSideBarClose: true,
    isChatSideBarClose: false,

}
const sideBarSlice = createSlice({
    name: "sideBar",

    initialState: initialState,
    reducers: {
        isSideBarCloseReducser: ((state, action) => {
            state.isSideBarClose = action.payload
        }),
        isChatSideBarCloseReducer: ((state, action) => {
            state.isSideBarClose = action.payload
        })
    }
})
export const { isSideBarCloseReducser, isChatSideBarCloseReducer } = sideBarSlice.actions
export default sideBarSlice.reducer