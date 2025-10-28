import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isModalShow: false,
    isModalDelete: false,
    isNewChatModal: false,
    isNewGroupChatModal: false,
    isClientCompleteDocModal: false,
    isClientShareDocModal: false,
    isDeleteChannelModalShow: false,
    isAddDocumentModalShow: false,
    isShowRejectModal: false,
    isShowRestoreModal: false,
    isshowSignedDocumentModal: false

}
const modalSlice = createSlice({
    name: "modal",
    initialState: initialState,
    reducers: {
        isModalShowReducser: ((state, action) => {
            state.isModalShow = action.payload
        }),
        isDeleteChannelModalShowReducer: ((state, action) => {
            state.isDeleteChannelModalShow = action.payload
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
        isshowSignedDocumentModalClientPortalReducer: ((state, action) => {
            state.isshowSignedDocumentModal = action.payload
        }),
        isClientCompleteDocModalReducer: ((state, action) => {
            state.isClientCompleteDocModal = action.payload
        }),
        isClientShareDocModalReducer: ((state, action) => {
            state.isClientShareDocModal = action.payload
        }),
        isAddDocumentModalReducer: ((state, action) => {
            state.isAddDocumentModalShow = action.payload
        }),
        isModalShowRejectReducer: ((state, action) => {
            state.isShowRejectModal = action.payload
        }),
        isModalShowRestoreReducer: ((state, action) => {
            state.isShowRestoreModal = action.payload
        }),

    }
})
export const { isModalShowReducser, isModalDeleteReducer, isNewChatModalShowReducser, isModalShowRejectReducer,
    isModalShowRestoreReducer, isNewGroupChatModalShowReducser, isClientCompleteDocModalReducer,
    isAddDocumentModalReducer, isClientShareDocModalReducer, isDeleteChannelModalShowReducer, isshowSignedDocumentModalClientPortalReducer } = modalSlice.actions
export default modalSlice.reducer