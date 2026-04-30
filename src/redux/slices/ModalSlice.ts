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
  isshowSignedDocumentModal: false,

  // ✅ ADDED
  isInviteProviderModal: false,
  isCancelSubscriptionModal: false,
  isInviteToGroupModalShow: false,

  // Multi-client share modal (provider-side "Document Sharing" tab)
  isMultiClientDocShareModal: false,

  // Per-document recipients modal — shows which clients have a doc shared/signed
  isDocumentRecipientsModal: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState: initialState,
  reducers: {
    isModalShowReducser: (state, action) => {
      state.isModalShow = action.payload;
    },
    isDeleteChannelModalShowReducer: (state, action) => {
      state.isDeleteChannelModalShow = action.payload;
    },
    isNewChatModalShowReducser: (state, action) => {
      state.isNewChatModal = action.payload;
    },
    isNewGroupChatModalShowReducser: (state, action) => {
      state.isNewGroupChatModal = action.payload;
    },
    isModalDeleteReducer: (state, action) => {
      state.isModalDelete = action.payload;
    },
    isshowSignedDocumentModalClientPortalReducer: (state, action) => {
      state.isshowSignedDocumentModal = action.payload;
    },
    isClientCompleteDocModalReducer: (state, action) => {
      state.isClientCompleteDocModal = action.payload;
    },
    isClientShareDocModalReducer: (state, action) => {
      state.isClientShareDocModal = action.payload;
    },
    isAddDocumentModalReducer: (state, action) => {
      state.isAddDocumentModalShow = action.payload;
    },
    isModalShowRejectReducer: (state, action) => {
      state.isShowRejectModal = action.payload;
    },
    isModalShowRestoreReducer: (state, action) => {
      state.isShowRestoreModal = action.payload;
    },

    // ✅ ADDED
    isInviteProviderModalShowReducser: (state, action) => {
      state.isInviteProviderModal = action.payload;
    },
    isCancelSubscriptionModalShowReducer: (state, action) => {
      state.isCancelSubscriptionModal = action.payload;
    },
    isInviteToGroupModalShowReducer: (state, action) => {
      state.isInviteToGroupModalShow = action.payload;
    },
    isMultiClientDocShareModalReducer: (state, action) => {
      state.isMultiClientDocShareModal = action.payload;
    },
    isDocumentRecipientsModalReducer: (state, action) => {
      state.isDocumentRecipientsModal = action.payload;
    },
  },
});

export const {
  isModalShowReducser,
  isModalDeleteReducer,
  isNewChatModalShowReducser,
  isModalShowRejectReducer,
  isModalShowRestoreReducer,
  isNewGroupChatModalShowReducser,
  isClientCompleteDocModalReducer,
  isAddDocumentModalReducer,
  isClientShareDocModalReducer,
  isDeleteChannelModalShowReducer,
  isshowSignedDocumentModalClientPortalReducer,

  // ✅ ADDED
  isInviteProviderModalShowReducser,
  isCancelSubscriptionModalShowReducer,
  isInviteToGroupModalShowReducer,
  isMultiClientDocShareModalReducer,
  isDocumentRecipientsModalReducer,
} = modalSlice.actions;

export default modalSlice.reducer;
