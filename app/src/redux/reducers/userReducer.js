import { act } from "react";
import { FETCH_FOLDERS, SET_ACTIVITY_LOGS, SET_USER } from "../types";

const initialState = {
  userId: "676aee09b3f0d752bbbe58f7",
  userName: "",
  userEmail: "",
  userPhone: "",
  userGender: "",
  userLocation: "",
  profileImage: "",
  deviceId: "",
  isUserLoggedIn: false,
  deviceName: "",
  folders: [],
  totalSpace: null,
  usedSpace: null,
  activityLogs: []
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        userId: action.payload._id,
        userName: action.payload.name,
        userEmail: action.payload.email,
        userPhone: action.payload.phone,
        userGender: action.payload.gender,
        userLocation: action.payload.location,
        profileImage: action.payload.profile,
        deviceId: action.payload.device,
        isUserLoggedIn: true,
        deviceName: action.payload.device,
        totalSpace: action.payload.totalSpace,
        usedSpace: action.payload.usedSpace,
      };

    case FETCH_FOLDERS:
      return {
        ...state,
        folders: action.payload
      }
    case SET_ACTIVITY_LOGS:
      return {
        ...state,
        activityLogs: action.payload
      }
    default:
      return state;
  }
}
