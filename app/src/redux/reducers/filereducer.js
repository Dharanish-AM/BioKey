import {
  FETCH_FILES_REQUEST,
  FETCH_USED_SPACE,
  SET_SEARCH_QUERY,
  SET_TAB_BAR_VISIBLE,
} from "../types";

const initialState = {
  images: [],
  videos: [],
  audios: [],
  documents: [],
  recents: [],
  loading: false,
  usedSpace: {
    usedSpaceBytes: 0,
    usedSpacePercentage: 0,
    usedSpaceWithUnit: "",
  },
  searchQuery: "",
  filteredFiles: [],
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FILES_REQUEST:
      switch (action.payload.type) {
        case "images":
          return {
            ...state,
            images: [...action.payload.files],
          };
        case "videos":
          return {
            ...state,
            videos: [...action.payload.files],
          };
        case "audios":
          return {
            ...state,
            audios: [...action.payload.files],
          };
        case "others":
          return {
            ...state,
            others: [...action.payload.files],
          };
        case "recents":
          return {
            ...state,
            recents: [...action.payload.files],
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

    case SET_SEARCH_QUERY:
      const query = action.payload.toLowerCase();

      const allFiles = [
        ...state.images,
        ...state.videos,
        ...state.audios,
        ...state.documents,
        ...state.recents,
      ];

      const filteredFiles = allFiles.filter((file) => {
        const fileName = (file.fileName || file.name || "").toLowerCase();
        return fileName.includes(query);
      });

      return {
        ...state,
        searchQuery: action.payload,
        filteredFiles,
      };

    case SET_TAB_BAR_VISIBLE:
      return {
        ...state,
        tabBarVisible: action.payload,
      };

    default:
      return state;
  }
};

export default fileReducer;
