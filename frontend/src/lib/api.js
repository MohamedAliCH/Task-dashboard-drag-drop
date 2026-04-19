import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if we hit our structured backend error
    if (error.response?.data?.error?.message) {
      console.error(`[API ERROR] ${error.response.data.error.message}`);
      error.message = error.response.data.error.message;
    } else if (error.response?.data?.msg) {
      console.error(`[API ERROR] ${error.response.data.msg}`);
      error.message = error.response.data.msg;
    } else if (error.request) {
      console.error("[API ERROR] Network Error - No response from server.");
      error.message = "Network Error - Sever unreachable.";
    }
    
    return Promise.reject(error);
  }
);

export default api;
