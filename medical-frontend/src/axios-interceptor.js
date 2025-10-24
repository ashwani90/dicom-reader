// src/axios-interceptor.js
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * Attach response interceptors to the given Axios instance
 */
export function setupInterceptors(api) {
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // Check if token expired (401) and not already retried
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Wait until token refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await api.post('/auth/refresh/');
          processQueue(null, true);
          return api(originalRequest); // Retry the original request
        } catch (refreshError) {
          processQueue(refreshError, null);
          history.push('/login'); // Redirect on refresh failure
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For all other errors
      return Promise.reject(error);
    }
  );
}
