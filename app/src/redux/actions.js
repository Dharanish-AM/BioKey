import {
  FETCH_FILES_REQUEST,
  FETCH_USED_SPACE,
  SET_FIRST_RENDER,
  SET_SEARCH_QUERY,
  SET_TAB_BAR_VISIBLE,
  SET_USER,
} from "./types";

export const fetchFilesAction = (type, files = []) => {
  console.log("Dispatching action to fetch files - " + type);
  return {
    type: FETCH_FILES_REQUEST,
    payload: { type, files },
  };
};

export const fetchUsedSpaceAction = (
  usedSpaceBytes,
  usedSpacePercentage,
  usedSpaceWithUnit
) => {
  return {
    type: FETCH_USED_SPACE,
    payload: {
      usedSpaceBytes,
      usedSpacePercentage,
      usedSpaceWithUnit,
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

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});
