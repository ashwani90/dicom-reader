import axios from 'axios';


// Create and configure the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/',
  withCredentials: true, // enables cookies / auth tokens
  credentials: "include",
  headers: {
    'Content-Type': 'application/json',
    
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token found");

        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh,
        });

        // Save new access token
        localStorage.setItem("access_token", res.data.access);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    return Promise.reject(error);
  }
);

// Optional: Add interceptors for request/response (logging, auth refresh, etc.)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;