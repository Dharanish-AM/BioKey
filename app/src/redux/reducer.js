import { FETCH_FILES_REQUEST } from "./types";

const initialState = {
  images: [],
  videos: [],
  audios: [],
  documents: [],
  recents: [],
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FILES_REQUEST:
      switch (action.payload.type) {
        case "images":
          return {
            ...state,
            images: action.payload.files,
          };
        case "videos":
          return {
            ...state,
            videos: action.payload.files,
          };
        case "audios":
          return {
            ...state,
            audios: action.payload.files,
          };
        case "documents":
          return {
            ...state,
            documents: action.payload.files,
          };
        case "recents":
          return {
            ...state,
            recents: action.payload.files,
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default fileReducer;
