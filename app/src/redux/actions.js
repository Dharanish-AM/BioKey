import { FETCH_FILES_REQUEST, FETCH_USED_SPACE } from "./types";

export const fetchFilesAction = (type, files = []) => {
  console.log("Dispatching action to fetch files");
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
