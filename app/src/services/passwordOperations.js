import axios from "axios";
import { setPasswords } from "../redux/actions";

const API_URL = "http://192.168.1.5:8000/api/passwords";

export const addPassword = async (
  userId,
  name,
  userName,
  email,
  password,
  website,
  note
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
      console.log("Password added successfully:", response.data);
      return response.data;
    } else {
      console.error("Failed to add password:", response.data);
      throw new Error("Failed to add password");
    }
  } catch (error) {
    console.error(
      "Error adding password:",
      error.response ? error.response.data : error.message
    );
    throw new Error("An error occurred while adding the password.");
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
