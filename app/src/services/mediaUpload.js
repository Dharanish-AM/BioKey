import axios from "axios";

const API_URL = "http://192.168.1.3:8000/api/files/upload";

export const uploadMedia = async (fileUri, fileName) => {
  const formData = new FormData();
  const file = {
    uri: fileUri,
    name: fileName,
  };

  let userId = "user123";
  formData.append("userId", userId);
  formData.append("file", file);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Upload successful", response.data);
      return { success: true, message: "Upload successful" };
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
