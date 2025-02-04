import {
  FETCH_FILES_REQUEST,
  FETCH_LIKED_FILES,
  FETCH_USED_SPACE,
  SET_SEARCH_QUERY,
  SET_TAB_BAR_VISIBLE,
  UPDATE_FILE_LIKE_STATUS,
  SET_ALL_FILES_METADATA,
  SET_RECYCLE_BIN_FILES
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
  likedFiles: [],
  allFilesMetadata: [],
  recycleBinFiles:[]
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

    case UPDATE_FILE_LIKE_STATUS:
      const { fileId, isLiked, type } = action.payload;

      const updateFiles = (files) => {
        return files.map(file =>
          file._id === fileId ? { ...file, isLiked } : file
        );
      };


      const updatedTypeFiles = updateFiles(state[type]);


      const updatedRecents = state.recents.map(file =>
        file._id === fileId ? { ...file, isLiked } : file
      );

      return {
        ...state,
        [type]: updatedTypeFiles,
        recents: updatedRecents,
      };

    case FETCH_LIKED_FILES:
      return {
        ...state,
        likedFiles: action.payload
      };

    case SET_ALL_FILES_METADATA:
      return {
        ...state,
        allFilesMetadata: action.payload
      }
    case SET_RECYCLE_BIN_FILES:
      return{
        ...state,
        recycleBinFiles: action.payload
      }
    default:
      return state;
  }
};

export default fileReducer;
