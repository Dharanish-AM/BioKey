import axios from 'axios';
import store from '../redux/store';

const getIP = () => {
  const state = store.getState();
  return state.appConfig.API_IP;
};

// Create axios instance
const httpClient = axios.create();

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;
    
    // Debug logging
    console.log('🔑 Token from Redux:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    // Set baseURL dynamically
    const API_IP = getIP();
    if (!config.url.startsWith('http')) {
      config.baseURL = `http://${API_IP}`;
    }
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized request - token may be invalid or expired');
    }
    return Promise.reject(error);
  }
);

export default httpClient;
