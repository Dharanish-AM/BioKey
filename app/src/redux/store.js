import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./reducer";

const store = configureStore({
  reducer: {
    files: fileReducer,
  },
});

export default store;
