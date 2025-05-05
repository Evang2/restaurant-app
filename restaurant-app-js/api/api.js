import axios from 'axios';

const API_URL = 'http://192.168.1.184:3000/api'; // Make sure this matches your backend's IP

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    // Log error details for easier debugging
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  } 
  
);

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data; // Assuming the backend returns a success message or token
  } catch (error) {
    console.error('Error during registration:', error);
    throw error; // Re-throw to handle it in the calling function
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data; // Assuming the backend returns a token
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export default api;
