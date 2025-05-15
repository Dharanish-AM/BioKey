import axios from "axios";
import {
  setActivityLogs,
  setFolders,
  setLikedFiles,
  setPlans,
  setStorageInfo,
  setUser,
  updateFileLikes,
} from "../redux/actions";
import store from "../redux/store";

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}/api/users`;

export const loadUser = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/user-details?userId=${userId}`
    );
    return response.data.user;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

export const likeOrUnlikeFile = async (
  userId,
  fileId,
  token,
  type,
  dispatch
) => {
  try {
    const response = await axios.post(`${API_URL}/likeorunlikefile`, {
      userId,
      fileId,
    });

    if (response.status === 200 && response.data.success) {
      dispatch(updateFileLikes(fileId, response.data.isLiked, type));
      fetchLikedFiles(userId, dispatch);
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

export const fetchLikedFiles = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/listfavourite`, {
      params: { userId },
    });

    const files = response.data?.files || [];

    dispatch(setLikedFiles(files));

    return files;
  } catch (error) {
    console.error("Error fetching liked files:", error.message);

    dispatch(setLikedFiles([]));

    return [];
  }
};

export const fetchFolderList = async (userId, token, dispatch) => {
  if (!userId) {
    console.error("User ID is required to fetch folders.");
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/listfolder`, {
      params: { userId },
    });
    if (response.status == 200) {
      dispatch(setFolders(response.data.folders));
    } else {
      console.warn("Failed to fetch folders:", response.data.message);
      dispatch(setFolders([]));
    }
  } catch (error) {
    console.error("Error fetching folders:", error.message);
    dispatch(setFolders([]));
  }
};

export const handleFolderCreate = async (
  userId,
  folderName,
  token,
  dispatch
) => {
  const response = await axios.post(
    `${API_URL}/createfolder`,
    {
      userId,
      folderName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status == 200 || response.status == 201) {
    fetchFolderList(userId, token, dispatch);
    return response.data;
  } else {
    return response.data;
  }
};

export const deleteFolders = async (userId, folderIds, token, dispatch) => {
  const response = await axios.delete(`${API_URL}/deletefolder`, {
    data: {
      userId,
      folderIds,
    },
  });
  if (response.status == 200) {
    await fetchFolderList(userId, token, dispatch);
    return response.data;
  } else {
    return response.data;
  }
};

export const handleFolderRename = async (
  userId,
  folderId,
  newFolderName,
  token,
  dispatch
) => {
  console.log(userId, folderId, newFolderName);
  const response = await axios.put(`${API_URL}/renamefolder`, {
    userId,
    folderId,
    newFolderName,
  });
  console.log(response);
  if (response.status == 200 || response.status == 201) {
    await fetchFolderList(userId, token, dispatch);
    return response.data;
  } else {
    return response.data;
  }
};

export const removeFileFromFolder = async (
  userId,
  folderId,
  fileId,
  token,
  dispatch
) => {
  const response = await axios.post(`${API_URL}/removefilefromfolder`, {
    userId,
    folderId,
    fileId,
  });
  if (response.status == 200) {
    await fetchFolderList(userId, token, dispatch);
    return response.data;
  } else {
    return response.data;
  }
};

export const handleFolderMove = async (
  userId,
  folderId,
  fileId,
  token,
  dispatch
) => {
  try {
    const response = await axios.post(`${API_URL}/addfilestofolder`, {
      userId,
      folderId,
      fileId,
    });

    if (response.status) {
      await fetchFolderList(userId, token, dispatch);
      return response.data;
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProfile = async (
  userId,
  profileData,
  token,
  dispatch
) => {
  try {
    const response = await axios.put(`${API_URL}/updateuserprofile`, {
      userId,
      profileData,
    });

    if (response.status === 200 && response.data.success) {
      const user = await loadUser(userId);
      dispatch(setUser(user));
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "An error occurred" };
  }
};

export const handleProfileImageSet = async (
  userId,
  formData,
  token,
  dispatch
) => {
  try {
    const response = await axios.post(
      `${API_URL}/updateuserprofileimage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status == 200) {
      const user = await loadUser(userId);
      dispatch(setUser(user));
      return response.data;
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
};

export const registerNotificationToken = async (token, userId) => {
  try {
    const response = await axios.post(`${API_URL}/registernotificationtoken`, {
      token,
      userId,
    });
    if (response.status === 200 && response.data.success) {
      console.log(" Notification token registered successfully");
    } else {
      console.log("Failed to register notification token");
    }
  } catch (err) {
    console.log(err);
  }
};

export const getNotifications = async (userId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/getallnotifications?userId=${userId}`
    );
    return response.data.notifications;
  } catch (err) {
    console.log(err);
  }
};

export const clearNotification = async (
  userId,
  notificationId,
  isAll = false,
  token
) => {
  try {
    const response = await axios.post(`${API_URL}/clearnotification`, {
      userId,
      notificationId,
      isAll,
    });
    if (response.status === 200 && response.data.success) {
      console.log("Notification cleared successfully");
      return response.data;
    } else {
      console.log("Failed to clear notification");
    }
  } catch (err) {
    console.log(err);
  }
};

export const getActivityLogs = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/getactivitylogs?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const logs = response.data.logs;
    dispatch(setActivityLogs(logs));
  } catch (err) {
    console.log(err);
  }
};

export const deleteAccount = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      data: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data.success) {
      console.log("Account deleted successfully");
      return response.data;
    } else {
      console.log("Failed to delete account");
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
};

export const changePassword = async (
  userId,
  oldPassword,
  newPassword,
  token
) => {
  try {
    const response = await axios.post(`${API_URL}/changepassword`, {
      userId,
      oldPassword,
      newPassword,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "An error occurred while changing password",
    };
  }
};

export const getStorageInfo = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/storageinfo?userId=${userId}`);
    if (response.data.success) {
      dispatch(setStorageInfo(response.data.data));
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAllPlans = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/getallplans?userId=${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success) {
      dispatch(setPlans(response.data.plans));
    }
  } catch (err) {
    console.log(err);
  }
};
