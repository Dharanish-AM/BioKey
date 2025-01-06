import axios from "axios";
import { setUser } from "../redux/actions";
const API_URL = "http://172.20.10.2:8000/api/users";

export const loadProfile = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/details?userId=${userId}`);
    await dispatch(setUser(response.data.user));
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};