import axios from "axios";
import { setFolders, setLikedFiles, setUser, updateFileLikes } from "../redux/actions";
import store from "../redux/store";


const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}/api/users`;


export const loadUser = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/user-details?userId=${userId}`);
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

export const fetchLikedFiles = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/listfavourite`, { params: { userId } });

    const files = response.data?.files || [];

    dispatch(setLikedFiles(files));

    return files;
  } catch (error) {
    console.error('Error fetching liked files:', error.message);


    dispatch(setLikedFiles([]));

    return [];
  }
};


export const fetchFolderList = async (userId, dispatch) => {
  if (!userId) {
    console.error("User ID is required to fetch folders.");
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/listfolder`, { params: { userId } });
    if (response.status == 200) {
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

export const handleFolderCreate = async (userId, folderName, dispatch) => {
  const response = await axios.post(`${API_URL}/createfolder`, {
    userId,
    folderName
  })
  if (response.status == 200) {

    return response.data
  }
  else {
    return response.data
  }
}

export const deleteFolders = async (userId, folderIds, dispatch) => {
  const response = await axios.delete(`${API_URL}/deletefolder`, {
    data: {
      userId,
      folderIds
    }
  })
  if (response.status == 200) {
    await fetchFolderList(userId, dispatch)
    return response.data
  } else {
    return response.data
  }
}

export const handleFolderRename = async (userId, folderId, newFolderName, dispatch) => {
  const response = await axios.put(`${API_URL}/renamefolder`, {
    userId,
    folderId,
    newFolderName
  })
  if (response.status == 200) {
    await fetchFolderList(userId, dispatch)
    return response.data
  } else {
    return response.data
  }
}

export const handleFolderMove = async (userId, folderId, fileId, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/addfilestofolder`, {
      userId,
      folderId, fileId
    })
    console.log(response.data)
    if (response.status) {
      await fetchFolderList(userId, dispatch)
      return response.data
    }
    else {
      return response.data
    }
  }
  catch (err) {
    console.log(err)
  }
}