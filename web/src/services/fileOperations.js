import axios from "axios";
import {
  fetchFilesAction,
  fetchUsedSpaceAction,
  setAllFilesMetadata,
  setLikedFiles,
  setRecycleBinFile,
} from "../redux/actions";
import { formatFileSize } from "../utils/formatFileSize";
import store from "../redux/store";
import { fetchFolderList, getStorageInfo, loadUser } from "./userOperations";

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `https://${getIP()}/api/files`;

export const uploadMedia = async (userId, files, token, dispatch) => {
  const formData = new FormData();
  formData.append("userId", userId);

  files.forEach((file) => {
    console.log("Uploading file:", file);
    formData.append("file", file);
  });

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const { errors } = response.data;

      if (errors && errors.length > 0) {
        console.error("Some files failed to upload:", errors);
        return {
          success: false,
          message: `Some files failed to upload: ${errors.join(", ")}`,
        };
      }

      await fetchRecentFiles(userId, token, dispatch);
      await fetchUsedSpace(userId, token, dispatch);
      await getAllfileMetadata(userId, token, dispatch);

      return { success: true, message: "Upload successful and files updated" };
    } else {
      console.error("Upload failed with status code:", response.status);
      return {
        success: false,
        message: `Upload failed with status code: ${response.status}`,
      };
    }
  } catch (error) {
    handleUploadError(error);
    return { success: false, message: "Upload failed. Please try again." };
  }
};

const handleUploadError = (error) => {
  if (error.response) {
    console.error("Error response:", error.response.data);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Request error:", error.message);
  }
};

export const fetchFilesByCategory = async (
  userId,
  category,
  token,
  dispatch,
) => {
  try {
    const response = await axios.get(`${API_URL}/list`, {
      params: {
        userId,
        category,
      },
    });

    if (response.status == 200) {
      const files = response.data.files;
      dispatch(fetchFilesAction(category, files || []));
    } else {
      console.error("Error fetching files:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

export const fetchRecentFiles = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/recent?userId=${userId}`, {});

    if (response.status === 200) {
      dispatch(fetchFilesAction("recents", response.data.files || []));
    } else {
      console.error("Error fetching recent files:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching recent files:", error);
  }
};

export const fetchUsedSpace = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/usedspace?userId=${userId}`);
    if (response.status === 200) {
      const usedSpaceBytes = response.data.usedSpace || 0;
      const totalSpaceBytes = response.data.totalSpace || 0;
      dispatch(fetchUsedSpaceAction(usedSpaceBytes, totalSpaceBytes));
    } else {
      console.error("Error fetching used space:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching used space:", error);
  }
};

export const previewFile = async (userId, fileId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/previewfile?userId=${userId}&fileId=${fileId}`,
    );
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(
        "Error fetching file preview:",
        response.data.message || response,
      );
      return null;
    }
  } catch (error) {
    console.error("Error generating URL:", error.message);
    return null;
  }
};

export const deleteFile = async (userId, fileId, type, token, dispatch) => {
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      data: {
        userId,
        fileId,
      },
    });

    console.log("File deleted successfully:", response.data);

    await fetchFilesByCategory(userId, type, token, dispatch);
    await fetchRecentFiles(userId, token, dispatch);
    await fetchUsedSpace(userId, token, dispatch);
    await fetchRecycleBinFiles(userId, token, dispatch);
    await fetchFolderList(userId, token, dispatch);
    await getAllfileMetadata(userId, token, dispatch);
    await getStorageInfo(userId, token, dispatch);

    return {
      success: true,
      message: "File deleted successfully.",
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      console.error(
        "Server Error:",
        error.response.data.message || error.response.data,
      );
      console.error("Status Code:", error.response.status);
      return {
        success: false,
        message: error.response.data.message || "Server error occurred.",
      };
    } else if (error.request) {
      console.error(
        "No response received from server. Check network connectivity.",
      );
      return {
        success: false,
        message:
          "No response from server. Please check your internet connection.",
      };
    } else {
      console.error("Request Error:", error.message);
      return {
        success: false,
        message: error.message || "An unknown error occurred.",
      };
    }
  }
};

export const permanentDelete = async (
  userId,
  fileId = null,
  all = false,
  token,
  dispatch,
) => {
  console.log(userId, fileId);
  try {
    const response = await axios.delete(`${API_URL}/permanentdelete`, {
      data: {
        userId,
        fileId,
        all,
      },
    });
    if (response.status == 200) {
      await fetchRecycleBinFiles(userId, token, dispatch);
      await getAllfileMetadata(userId, token, dispatch);
      return response.data;
    } else {
      return response.data;
    }
  } catch (err) {
    console.err(" Error deleting file:", err);
  }
};

export const restoreFile = async (
  userId,
  RecycleBinId,
  type,
  token,
  dispatch,
) => {
  console.log(RecycleBinId, type);
  try {
    const response = await axios.post(`${API_URL}/restorefile`, {
      userId,
      RecycleBinId,
      type,
    });

    if (response.status === 200) {
      await Promise.all([
        fetchFilesByCategory(userId, type, token, dispatch),
        fetchRecentFiles(userId, token, dispatch),
        fetchUsedSpace(userId, token, dispatch),
        fetchRecycleBinFiles(userId, token, dispatch),
        getAllfileMetadata(userId, token, dispatch),
      ]);
      return response.data;
    } else {
      return { success: false, message: "Failed to restore files." };
    }
  } catch (err) {
    console.error("Error Restoring File", err);
    return { success: false, message: "Server error while restoring files." };
  }
};

export const fetchRecycleBinFiles = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/recyclebinfiles?userId=${userId}`,
    );
    if (response.status == 200) {
      dispatch(setRecycleBinFile(response.data.files));
      return response.data;
    } else {
      return response.data;
    }
  } catch (err) {
    console.error("Error fetching recycle bin files:", err);
  }
};

export const getAllfileMetadata = async (userId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/allfilemetadata?userId=${userId}`,
    );

    if (response.status === 200) {
      const { files = [], passwords = [], folders = [] } = response.data;

      dispatch(setAllFilesMetadata({ files, passwords, folders }));

      return response.data;
    } else {
      return response.data;
    }
  } catch (err) {
    console.error("Error fetching all file metadata:", err.message);
  }
};
