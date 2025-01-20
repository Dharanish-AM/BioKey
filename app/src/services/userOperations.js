import axios from "axios";
import { setFolders, setUser, updateFileLikes } from "../redux/actions";
import store from "../redux/store";
import { fetchLikedFiles } from "./fileOperations";

const getIP = () => {
  const state = store.getState();
  console.log(state.appConfig.API_IP);
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}:8000/api/users`;

console.log(API_URL);

export const loadProfile = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/details?userId=${userId}`);
    await dispatch(setUser(response.data.user));
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

export const likeOrUnlikeFile = async (userId, fileId, dispatch, type) => {
  try {
    const response = await axios.post(`${API_URL}/likeorunlikefile`, {
      userId,
      fileId,
    });

    if (response.status === 200 && response.data.success) {
      dispatch(updateFileLikes(fileId, response.data.isLiked, type));
      fetchLikedFiles(userId, dispatch)
      return {
        success: true,
        isLiked: response.data.isLiked,
      };
    }

    return {
      success: false,
      message: "Failed to like/unlike file",
    };
  } catch (error) {
    console.error("Error in likeOrUnlikeFile:", error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};


export const fetchFolderList = async (userId, dispatch) => {
  if (!userId) {
    console.error("User ID is required to fetch folders.");
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/listfolder`, { params: { userId } });
    if (response.data.success) {
      dispatch(setFolders(response.data.folders));
    } else {
      console.warn("Failed to fetch folders:", response.data.message);
      dispatch(setFolders([]));
    }
  } catch (error) {
    console.error("Error fetching folder list:", error.message);
    dispatch(setFolders([]));
  }
};