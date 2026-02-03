import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

const api = axios.create({
  baseURL: API_ENDPOINTS.api,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        return api
          .post("/auth/refresh")
          .then((res) => {
            const { accessToken } = res.data.data;
            localStorage.setItem("accessToken", accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            return api(originalRequest);
          })
          .catch((err) => {
            processQueue(err, null);
            // Token refresh failed, redirect to login
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return Promise.reject(err);
          });
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
