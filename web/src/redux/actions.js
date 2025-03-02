import {
  FETCH_FILES_REQUEST,
  FETCH_USED_SPACE,
  SET_FIRST_RENDER,
  SET_SEARCH_QUERY,
  SET_TAB_BAR_VISIBLE,
  SET_USER,
  SET_PASSWORD,
  UPDATE_FILE_LIKE_STATUS,
  FETCH_LIKED_FILES,
  FETCH_FOLDERS,
  SET_ALL_FILES_METADATA,
  SET_RECYCLE_BIN_FILES,
  SET_AUTH_STATE,
  SET_ACTIVITY_LOGS,
  SET_STORAGE_INFO
} from "./types";


export const setAuthState = (isAuthenticated, token) => ({
  type: SET_AUTH_STATE,
  payload: { isAuthenticated, token },
});

export const fetchFilesAction = (type, files = []) => {
  console.log("Dispatching action to fetch files - " + type);
  return {
    type: FETCH_FILES_REQUEST,
    payload: { type, files },
  };
};

export const fetchUsedSpaceAction = (
  usedSpaceBytes,
  totalSpaceBytes
) => {
  return {
    type: FETCH_USED_SPACE,
    payload: {
      usedSpaceBytes,
      totalSpaceBytes
    },
  };
};

export const setSearchQuery = (query) => {
  console.log("Dispatching action to set search query - " + query);
  return {
    type: SET_SEARCH_QUERY,
    payload: query,
  };
};

export const setTabBarVisible = (isVisible) => ({
  type: SET_TAB_BAR_VISIBLE,
  payload: isVisible,
});

export const setFirstRender = (screen) => ({
  type: SET_FIRST_RENDER,
  screen,
});

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  }
}

export const setPasswords = (passwords) => ({
  type: SET_PASSWORD,
  payload: passwords,
});


export const updateFileLikes = (fileId, isLiked, type) => {
  return {
    type: UPDATE_FILE_LIKE_STATUS,
    payload: {
      fileId,
      isLiked,
      type
    }
  };
};


export const setLikedFiles = (files) => {
  return {
    type: FETCH_LIKED_FILES,
    payload: files
  }
}

export const setFolders = (folders) => {
  return {
    type: FETCH_FOLDERS,
    payload: folders
  }
}


export const setAllFilesMetadata = (allFiles) => ({
  type: SET_ALL_FILES_METADATA,
  payload: allFiles,
});


export const setRecycleBinFile = (file) => {
  return {
    type: SET_RECYCLE_BIN_FILES,
    payload: file
  }
}

export const setActivityLogs = (logs) => {
  return {
    type: SET_ACTIVITY_LOGS,
    payload: logs
  }
}

export const setStorageInfo = (storageInfo) => {
  return {
    type: SET_STORAGE_INFO,
    payload: storageInfo
  }
}