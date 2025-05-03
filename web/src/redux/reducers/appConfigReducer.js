import { SET_TAB_BAR_VISIBLE, SET_FIRST_RENDER, SET_PLANS } from "../types";

const initialState = {
  tabBarVisible: true,
  isFirstRender: {
    homeScreen: true,
    imagesScreen: true,
    videosScreen: true,
    audiosScreen: true,
    othersScreen: true,
    passwordsScreen: true,
    filePreviewScreen: true,
    favouritesScreen: true,
    folderPreviewScreen: true,
    recycleBinScreen: true,
  },
  plans: null,
  API_IP: import.meta.env.VITE_API_URL,
  version: "1.0",
};

console.log("API_IP", initialState.API_IP);

export const appConfigReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TAB_BAR_VISIBLE:
      return {
        ...state,
        tabBarVisible: action.payload,
      }; 
    case SET_FIRST_RENDER:
      return {
        ...state,
        isFirstRender: {
          ...state.isFirstRender,
          [action.screen]: false,
        },
      };
    case SET_PLANS:
      return {
        ...state,
        plans: action.payload,
      };
    default:
      return state;
  }
};

export default appConfigReducer;
