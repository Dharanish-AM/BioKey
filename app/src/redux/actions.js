import { FETCH_FILES_REQUEST } from "./types";

export const fetchFiles = (type, files = []) => {
  console.log("Dispatching action to fetch files");
  return {
    type: FETCH_FILES_REQUEST,
    payload: { type, files },
  };
};
