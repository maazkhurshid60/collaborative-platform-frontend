import { createSlice } from "@reduxjs/toolkit";

const joinUserSlice = createSlice({
    name: "joinUserSlice",
    initialState: { data: { groupId: "", memberEmail: "", isNewJoin: false } },
    reducers: {
        addDataNewJoinUserReducer: ((state, action) => {
            console.log("action", action.payload);

            state.data = action.payload

        }),
        emptyDataNewJoinUserReducer: ((state) => {
            state.data = { groupId: "", memberEmail: "", isNewJoin: false }

        })
    }
})

export const { addDataNewJoinUserReducer, emptyDataNewJoinUserReducer } = joinUserSlice.actions
export default joinUserSlice.reducer