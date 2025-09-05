import { SET_TAB_BAR_VISIBLE, SET_FIRST_RENDER } from "../types";

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
  API_IP: "172.17.18.129:8000",
  version: "1.0",
};

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
    default:
      return state;
  }
};

export default appConfigReducer;
