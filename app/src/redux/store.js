import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./reducers/filereducer";
import appConfigReducer from "./reducers/appConfigReducer";

const store = configureStore({
  reducer: {
    files: fileReducer,
    appConfig: appConfigReducer,
  },
});

export default store;
