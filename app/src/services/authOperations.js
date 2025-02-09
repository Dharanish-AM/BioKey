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


export const loginCreds = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login-credentials`, { email, password });
        if (response.status == 200) {
            console.log("Login Success")
            return response.data
        }
        else {
            console.log("Login Failed")
            return response.data
        }
    }
    catch (err) {
        console.log(err);
    }
}

export const loginFp = async (uniqueKeyEncrypted, serialNumber) => {
    try {
        const response = await axios.post(`${API_URL}/login-fingerprint`, { uniqueKeyEncrypted, serialNumber })
        return response.data
    }
    catch (err) {
        console.log(err);
    }
}


export const checkTokenIsValid = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/check-token-is-valid`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data

    } catch (err) {
        return false;
    }
};
