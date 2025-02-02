import axios from "axios";
import { fetchFilesAction, fetchUsedSpaceAction, setLikedFiles } from "../redux/actions";
import { formatFileSize } from "../utils/formatFileSize";
import store from "../redux/store";

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}/api/files`;

export const uploadMedia = async (userId, files, dispatch) => {
  const formData = new FormData();
  formData.append("userId", userId);

  files.forEach((file) => {
    const { uri, fileName, name } = file;
    const fileNameToUse = fileName || name;
    formData.append("file", {
      uri,
      name: fileNameToUse,
    });
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

      await fetchUsedSpace(userId, dispatch);

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


export const fetchFilesByCategory = async (userId, category, dispatch) => {
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

export const fetchRecentFiles = async (userId, dispatch) => {
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

export const fetchUsedSpace = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/usedspace?userId=${userId}`);
    if (response.status === 200) {
      const usedSpaceBytes = response.data.usedSpace || 0;
      const totalSpaceBytes = response.data.totalSpace || 0;
      const usedSpacePercentage = (
        (usedSpaceBytes / totalSpaceBytes) *
        100
      ).toFixed(2);
      const usedSpaceWithUnit = formatFileSize(usedSpaceBytes);

      dispatch(
        fetchUsedSpaceAction(
          usedSpaceBytes,
          usedSpacePercentage,
          usedSpaceWithUnit
        )
      );
    } else {
      console.error("Error fetching used space:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching used space:", error);
  }
};


export const previewFile = async (userId, fileId) => {
  try {
    const response = await axios.get(`${API_URL}/previewfile?userId=${userId}&fileId=${fileId}`);
    if (response.status === 200) {
      return response.data.url;
    } else {
      console.error("Error fetching file preview:", response.data.message || response);
      return null;
    }
  } catch (error) {
    console.error("Error generating URL:", error.message);
    return null;
  }
};


export const deleteFile = async (userId, fileId, type, dispatch) => {
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      data: {
        userId,
        fileId,
      },
    });

    console.log("File deleted successfully:", response.data);

    fetchFilesByCategory(userId, type, dispatch);
    fetchRecentFiles(userId, dispatch);
    fetchUsedSpace(userId, dispatch);

    return {
      success: true,
      message: "File deleted successfully.",
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      console.error(
        "Server Error:",
        error.response.data.message || error.response.data
      );
      console.error("Status Code:", error.response.status);
      return {
        success: false,
        message: error.response.data.message || "Server error occurred.",
      };
    } else if (error.request) {
      console.error(
        "No response received from server. Check network connectivity."
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


export const fetchLikedFiles = async (userId, dispatch) => {
  console.log("Called")
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