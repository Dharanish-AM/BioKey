import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./reducers/filereducer";
import appConfigReducer from "./reducers/appConfigReducer";
import userReducer from "./reducers/userReducer";
import passwordReducer from "./reducers/passwordReducer";

const store = configureStore({
  reducer: {
    files: fileReducer,
    appConfig: appConfigReducer,
    user:userReducer,
    passwords:passwordReducer
  },
});

export default store;
