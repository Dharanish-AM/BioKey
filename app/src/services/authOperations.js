import axios from "axios";
import store from "../redux/store";

const getIP = () => {
    const state = store.getState();
    return state.appConfig.API_IP;
};

const API_URL = `http://${getIP()}/api/users`;

export const registerUser = async (form) => {
    try {
        const response = await axios.post(`${API_URL}/register`, form);
        if (response.status == 200 || 201) {

            return response.data;
        }
        else {
            return response.data;
        }
    } catch (err) {
        console.log(err);
    }
}