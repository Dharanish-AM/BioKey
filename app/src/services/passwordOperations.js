import axios from "axios";
import { setPasswords } from "../redux/actions";
import store from "../redux/store";

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}:8000/api/passwords`;

export const addPassword = async (
  userId,
  name,
  userName,
  email,
  password,
  website,
  note,
  dispatch
) => {
  try {
    const response = await axios.post(`${API_URL}/addpassword`, {
      userId,
      name,
      userName,
      email,
      password,
      website,
      note,
    });

    if (response.status === 201) {
      getAllPasswords(userId, dispatch);
      return {
        status: true,
        message: response.data.message || "Password added successfully!",
      };
    } else {
      console.error("Unexpected response status:", response.status);
      return {
        status: false,
        message:
          response.data.message || "Failed to add password. Please try again.",
      };
    }
  } catch (error) {
    console.error(
      "Error adding password:",
      error.response ? error.response.data : error.message
    );
    return {
      status: false,
      message: "An error occurred while adding the password. Please try again.",
    };
  }
};

export const getAllPasswords = async (userId, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/getallpasswords?userId=${userId}`
    );
    if (response.status === 200) {
      dispatch(setPasswords(response.data.data || []));
    } else {
      console.error("Failed to retrieve passwords:", response.data);
      throw new Error("Failed to retrieve passwords");
    }
  } catch (error) {
    console.error(
      "Error retrieving passwords:",
      error.response ? error.response.data : error.message
    );
    throw new Error("An error occurred while retrieving the passwords.");
  }
};

export const deletePassword = async (userId, passwordId, dispatch) => {
  try {
    const response = await axios.delete(`${API_URL}/deletepassword`, {
      params: {
        userId,
        passwordId,
      },
    });

    if (response.status === 200) {
     
      getAllPasswords(userId, dispatch);

      return {
        status: true,
        message: response.data.message || "Password deleted successfully.",
      };
    } else {
      console.error("Unexpected response status:", response.status);
      return {
        status: false,
        message:
          response.data.message ||
          "Failed to delete password. Please try again.",
      };
    }
  } catch (error) {
    console.error(
      "Error deleting password:",
      error.response ? error.response.data : error.message
    );

    return {
      status: false,
      message: error.response
        ? error.response.data.error ||
          "An error occurred while deleting the password."
        : "An error occurred while deleting the password. Please try again.",
    };
  }
};
