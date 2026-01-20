import client from "./httpClient";
import { setPasswords } from "../redux/actions";
import sha1 from "crypto-js/sha1";

const API_URL = `/api/passwords`;

export const addPassword = async (
  userId,
  token,
  name,
  userName,
  email,
  password,
  website,
  note,
  dispatch,
) => {
  try {
    console.log(userId, token, name, userName, email, password, website, note);
    const response = await client.post(`${API_URL}/addpassword`, {
      userId,
      name,
      userName,
      email,
      password,
      website,
      note,
    });

    if (response.status === 201) {
      getAllPasswords(userId, token, dispatch);
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
      error.response ? error.response.data : error.message,
    );
    return {
      status: false,
      message: "An error occurred while adding the password. Please try again.",
    };
  }
};

export const getAllPasswords = async (userId, token, dispatch) => {
  try {
    const response = await client.get(
      `${API_URL}/getallpasswords?userId=${userId}`,
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
      error.response ? error.response.data : error.message,
    );
    throw new Error("An error occurred while retrieving the passwords.");
  }
};

export const deletePassword = async (userId, passwordId, token,dispatch) => {
  try {
    const response = await client.delete(`${API_URL}/deletepassword`, {
      params: {
        userId,
        passwordId,
      },
    });

    if (response.status === 200) {
      await getAllPasswords(userId,token, dispatch);

      return {
        success: true,
        message: response.data.message || "Password deleted successfully.",
      };
    } else {
      console.error("Unexpected response status:", response.status);
      return {
        success: false,
        message:
          response.data.message ||
          "Failed to delete password. Please try again.",
      };
    }
  } catch (error) {
    console.error(
      "Error deleting password:",
      error.response ? error.response.data : error.message,
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

export const getPassword = async (userId, passwordId) => {
  try {
    const response = await client.get(`${API_URL}/getpassword`, {
      params: {
        userId,
        passwordId,
      },
    });
    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to retrieve password:", response.data);
      throw new Error("Failed to retrieve password");
    }
  } catch (error) {
    console.error("Error retrieving password:", error.message);
    throw new Error("Error retrieving password");
  }
};

export const getPasswordBreachStatus = async (password) => {
  const hashedPassword = sha1(password).toString();
  const hashPrefix = hashedPassword.slice(0, 5);
  const hashSuffix = hashedPassword.slice(5);

  try {
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
    );

    const breachedPasswords = response.data
      .split("\n")
      .map((entry) => entry.trim());

    const matchedHash = breachedPasswords.find((entry) =>
      entry.toLowerCase().startsWith(hashSuffix.toLowerCase()),
    );

    if (matchedHash) {
      const breachCount = matchedHash.split(":")[1];

      return {
        breached: true,
        breachCount: parseInt(breachCount, 10),
        message: `Password found in ${breachCount} breaches.`,
      };
    } else {
      return {
        breached: false,
        breachCount: 0,
        message: "Password is safe, not found in any breach.",
      };
    }
  } catch (error) {
    console.error(
      "Error occurred while checking password breach status:",
      error,
    );
    return {
      breached: false,
      breachCount: 0,
      message: "Error occurred while checking the breach status.",
    };
  }
};

export const handlePasswordUpdate = async (
  userId,
  passwordId,
  updatedData,
  token,
  dispatch,
) => {
  try {
    const response = await client.put(`${API_URL}/updatepassword`, {
      userId,
      passwordId,
      updatedData,
    });
    if (response.status === 200) {
      getAllPasswords(userId, token,dispatch);
      return {
        success: true,
        message: response.data.message || "Password updated successfully.",
        data: response.data.data,
      };
    } else {
      console.error("Unexpected response status:", response.status);
      return {
        success: false,
        message:
          response.data.message ||
          "Failed to update password. Please try again.",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error updating password:", error);
  }
};
