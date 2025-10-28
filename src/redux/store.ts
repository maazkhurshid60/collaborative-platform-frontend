import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";
import sideBarSlice from "./slices/SideBarSlice";
import blockListUserSlice from "./slices/BlockListUserSlice";
import modalSlice from "./slices/ModalSlice";
import LoginUserDetail from "./slices/LoginUserDetailSlice";
import joinUserSlice from "./slices/JoinNowUserSlice";

// COMBINING ALL SLICES
const rootReducer = combineReducers({
    sideBarSlice,
    blockListUserSlice,
    modalSlice,
    LoginUserDetail,
    joinUserSlice,

})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

// CONFIGURATION FOR REDUX-PERSIST
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["sideBarSlice", "blockListUserSlice", "modalSlice", "LoginUserDetail", "joinUserSlice"]
}

const persistedReducer = persistReducer(persistConfig, rootReducer);
// CONFIGURE STORE WITH PERSISTED REDUCER
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/REGISTER",
                    "persist/PAUSE",
                    "persist/PURGE",
                    "persist/FLUSH",
                ],
            },
        }),
});

// CREATE PERSISTOR OBJECT
const persistor = persistStore(store);

export { store, persistor };

export default store;