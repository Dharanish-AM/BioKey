import {
  FETCH_FILES_REQUEST,
  FETCH_LIKED_FILES,
  FETCH_USED_SPACE,
  SET_SEARCH_QUERY,
  SET_TAB_BAR_VISIBLE,
  UPDATE_FILE_LIKE_STATUS,
  SET_ALL_FILES_METADATA,
  SET_RECYCLE_BIN_FILES,
} from "../types";

const initialState = {
  images: [],
  videos: [],
  audios: [],
  others: [],
  recents: [],
  loading: false,
  usedSpace: {
    usedSpaceBytes: 0,
    totalSpaceBytes: 0,
  },
  searchQuery: "",
  filteredFiles: [],
  likedFiles: [],
  allFilesMetadata: {
    files: [],
    passwords: [],
    folders: [],
  },
  recycleBinFiles: [],
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FILES_REQUEST:
      return {
        ...state,
        [action.payload.type]: [...action.payload.files],
      };

    case FETCH_USED_SPACE:
      return {
        ...state,
        usedSpace: {
          usedSpaceBytes: action.payload.usedSpaceBytes,
          totalSpaceBytes: action.payload.totalSpaceBytes,
        },
      };

    case SET_SEARCH_QUERY: {
      const query = action.payload.toLowerCase();

      const allFiles = [
        ...state.images,
        ...state.videos,
        ...state.audios,
        ...state.others,
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
    }

    case SET_TAB_BAR_VISIBLE:
      return {
        ...state,
        tabBarVisible: action.payload,
      };

    case UPDATE_FILE_LIKE_STATUS: {
      const { fileId, isLiked, type } = action.payload;

      if (!state[type]) return state;

      const updateFiles = (files) =>
        files.map((file) =>
          file._id === fileId ? { ...file, isLiked } : file,
        );

      return {
        ...state,
        [type]: updateFiles(state[type]),
        recents: updateFiles(state.recents),
      };
    }

    case FETCH_LIKED_FILES:
      return {
        ...state,
        likedFiles: action.payload,
      };

    case SET_ALL_FILES_METADATA:
      return {
        ...state,
        allFilesMetadata: {
          files: action.payload.files || [],
          passwords: action.payload.passwords || [],
          folders: action.payload.folders || [],
        },
      };

    case SET_RECYCLE_BIN_FILES:
      return {
        ...state,
        recycleBinFiles: action.payload,
      };

    default:
      return state;
  }
};

export default fileReducer;
