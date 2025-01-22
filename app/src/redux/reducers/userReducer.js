import { FETCH_FOLDERS, SET_USER } from "../types";

const initialState = {
  userId: "676aee09b3f0d752bbbe58f7",
  userName: "",
  userEmail: "",
  profileImage: "",
  deviceId: "",
  isUserLoggedIn: false,
  deviceName: "",
  folders: []
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        userId: action.payload._id,
        userName: action.payload.name,
        userEmail: action.payload.email,
        profileImage: action.payload.profile,
        deviceId: action.payload.device,
        isUserLoggedIn: true,
        deviceName: action.payload.device,
      };

    case FETCH_FOLDERS:
      return {
        ...state,
        folders: action.payload
      }
    default:
      return state;
  }
}
