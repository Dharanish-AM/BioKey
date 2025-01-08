import { SET_USER } from "../types";

const initialState = {
  userId: "",
  userName: "",
  userEmail: "",
  profileImage: "",
  deviceId: "",
  isUserLoggedIn: false,
  deviceName: "",
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
    default:
      return state;
  }
}
