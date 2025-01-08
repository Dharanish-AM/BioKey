import axios from "axios";
import { fetchFilesAction, fetchUsedSpaceAction } from "../redux/actions";
import { formatFileSize } from "../utils/formatFileSize";
import store from "../redux/store";

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}:8000/api/files`;

export const uploadMedia = async (fileUri, fileName) => {
  const formData = new FormData();
  const file = {
    uri: fileUri,
    name: fileName,
  };

  let userId = "676aee09b3f0d752bbbe58f7";
  formData.append("userId", userId);
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      if (response.data.errors && response.data.errors.length > 0) {
        console.error("Some files failed to upload:", response.data.errors);
        return {
          success: false,
          message: `Some files failed to upload: ${response.data.errors.join(
            ", "
          )}`,
        };
      }
      console.log("Upload successful", response.data);
      return { success: true, message: "Upload successful and files updated" };
    } else {
      console.error("Upload failed with status code:", response.status);
      return {
        success: false,
        message: `Upload failed with status code: ${response.status}`,
      };
    }
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request error:", error.message);
    }
    return { success: false, message: "Upload failed. Please try again." };
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
      console.log(`Fetched Files of category ${category} `);
      console.log("Fetched files:", files.length);
      dispatch(fetchFilesAction(category, files || []));
    } else {
      console.error("Error fetching files:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

export const fetchRecentFiles = async (dispatch) => {
  try {
    const userId = "676aee09b3f0d752bbbe58f7";

    const response = await axios.get(`${API_URL}/recent?userId=${userId}`, {});

    if (response.status === 200) {
      dispatch(fetchFilesAction("recents", response.data.files || []));
      console.log("Fetched Recent Files");
    } else {
      console.error("Error fetching recent files:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching recent files:", error);
  }
};

export const fetchUsedSpace = async (dispatch) => {
  const TOTAL_SPACE = 5 * 1024 * 1024 * 1024;
  try {
    const response = await axios.get(
      `${API_URL}/usedspace?userId=676aee09b3f0d752bbbe58f7`
    );

    if (response.status === 200) {
      const usedSpaceBytes = response.data.usedSpace || 0;
      const usedSpacePercentage = (
        (usedSpaceBytes / TOTAL_SPACE) *
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

export const previewImage = async (userId, fileId) => {
  let url = "";
  try {
    url = `${API_URL}/previewimage?userId=${userId}&fileId=${fileId}`;
    return url;
  } catch (error) {
    console.error("Error generating URL:", error.message);
    return null;
  }
};

export const previewVideo = (userId, fileId) => {
  let url = "";
  try {
    url = `${API_URL}/previewvideo?userId=${userId}&fileId=${fileId}`;
    return url;
  } catch (error) {
    console.error("Error generating URL:", error.message);
    return null;
  }
};

export const previewAudio = (userId, fileId) => {
  let url = "";
  try {
    url = `${API_URL}/previewaudio?userId=${userId}&fileId=${fileId}`;
    return url;
  } catch (error) {
    console.error("Error generating URL:", error.message);
    return null;
  }
};
