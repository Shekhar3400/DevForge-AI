import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Never auto-logout on the OAuth redirect page — token is still being stored
    const isOAuthPage = window.location.pathname.startsWith("/oauth2");

    if (error.response?.status === 401 && !isOAuthPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Access denied.");
    } else if (error.response?.status === 500) {
      toast.error("Server error. Please try again.");
    } else if (!error.response && !isOAuthPage) {
      toast.error("Cannot reach server. Is the backend running?");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
