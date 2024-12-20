import { FETCH_FILES_REQUEST, FETCH_USED_SPACE } from "./types";

const initialState = {
  images: [],
  videos: [],
  audios: [],
  documents: [],
  recents: [],
  loading: false,
  usedSpace: {
    usedSpace: {
      usedSpaceBytes: 0,
      usedSpacePercentage: 0,
      usedSpaceWithUnit: "",
    },
  },
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
    case FETCH_USED_SPACE:
      return {
        ...state,
        usedSpace: {
          usedSpaceBytes: action.payload.usedSpaceBytes,
          usedSpacePercentage: action.payload.usedSpacePercentage,
          usedSpaceWithUnit: action.payload.usedSpaceWithUnit,
        },
      };

    default:
      return state;
  }
};

export default fileReducer;
