import axios from "axios";
import { fetchFilesAction, fetchUsedSpaceAction } from "../redux/actions";
import { formatFileSize } from "../utils/formatFileSize";

const API_URL = "http://192.168.1.3:8000/api/files";

export const uploadMedia = async (fileUri, fileName, category, dispatch) => {
  const formData = new FormData();
  const file = {
    uri: fileUri,
    name: fileName,
  };

  let userId = "user123";
  formData.append("userId", userId);
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Upload successful", response.data);

      await fetchFilesByCategory(userId, category, dispatch);

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

export const fetchFilesByCategory = async (
  userId,
  category,
  dispatch,
  page = 1,
  limit = 0
) => {
  try {
    const response = await axios.get(`${API_URL}/list`, {
      params: {
        userId,
        category,
        page,
        limit,
      },
    });

    if (response.data.success) {
      const files = response.data.files;
      console.log(`Fetched Files of category ${category} - Page ${page}`);
      console.log("Fetched files:", files.length);
      dispatch(fetchFilesAction(category, files));
    } else {
      console.error("Error fetching files:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

export const fetchRecentFiles = async (dispatch) => {
  try {
    const userId = "user123";

    const response = await axios.get(`${API_URL}/recent`, {
      params: { userId },
    });

    if (response.status === 200 && response.data.success) {
      dispatch(fetchFilesAction("recents", response.data.recentFiles || []));
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
    const response = await axios.get(`${API_URL}/usedspace?userId=user123`);

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

export const previewImage = async (
  userId,
  fileName,
  category,
  folder = null
) => {
  let url = "";
  try {
    if (folder) {
      url = `${API_URL}/previewimage?userId=${userId}&folder=${folder}&fileName=${fileName}`;
    } else {
      url = `${API_URL}/previewimage?userId=${userId}&category=${category}&fileName=${fileName}`;
    }
    return url;
  } catch (error) {
    console.error("Error generating image URL:", error.message);
    return null;
  }
};

export const previewVideo = (userId, category, fileName, folder = null) => {
  try {
    let url = `${API_URL}/previewvideo?userId=${userId}&category=${category}&fileName=${fileName}`;

    if (folder) {
      if (typeof folder !== "string" || folder.trim() === "") {
        throw new Error("Invalid folder provided");
      }

      url = `${API_URL}/previewvideo?userId=${userId}&category=${category}&folder=${folder}&fileName=${fileName}`;
    }

    return url;
  } catch (error) {
    console.error("Error generating video URL:", error.message);
    return null;
  }
};

export const previewAudio = (userId, category, fileName, folder = null) => {
  try {
    let url = `${API_URL}/previewaudio?userId=${userId}&category=${category}&fileName=${fileName}`;

    if (folder) {
      if (typeof folder !== "string" || folder.trim() === "") {
        throw new Error("Invalid folder provided");
      }

      url = `${API_URL}/previewaudio?userId=${userId}&category=${category}&folder=${folder}&fileName=${fileName}`;
    }

    return url;
  } catch (error) {
    console.error("Error generating audio URL:", error.message);
    return null;
  }
};
