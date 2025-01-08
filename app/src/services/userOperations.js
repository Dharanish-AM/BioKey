import axios from "axios";
import { setUser } from "../redux/actions";
import store from "../redux/store";

const getIP = () => {
  const state = store.getState();
  console.log(state.appConfig.API_IP);
  return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}:8000/api/users`;

export const loadProfile = async (userId, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/details?userId=${userId}`);
    await dispatch(setUser(response.data.user));
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};
