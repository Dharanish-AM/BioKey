import axios from "axios";
import store from "../redux/store";

const client = axios.create();

client.interceptors.request.use((config) => {
  const state = store.getState();
  const apiIP = state?.appConfig?.API_IP;
  const token = state?.auth?.token || localStorage.getItem("authToken");

  if (apiIP) {
    config.baseURL = `http://${apiIP}`;
  }

  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default client;
