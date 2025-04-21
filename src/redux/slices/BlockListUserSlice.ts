import { createSlice } from "@reduxjs/toolkit";

const blockListUserSlice = createSlice({
    name: "blockListUserSlice",
    initialState: { isBlockScreenShow: false },
    reducers: {
        isBlockScreenShowReducer: ((state, action) => {
            state.isBlockScreenShow = action.payload
        })
    }
})

export const { isBlockScreenShowReducer } = blockListUserSlice.actions
export default blockListUserSlice.reducer