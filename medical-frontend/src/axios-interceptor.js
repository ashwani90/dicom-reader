// src/axios-interceptor.js
import api from './api';
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

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  const originalRequest = error.config;
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    return new Promise((resolve, reject) => {
      api.post('/auth/refresh/')
        .then(() => {
          processQueue(null, true);
          resolve(api(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          // redirect to login
          history.push('/login');
          reject(err);
        })
        .finally(() => { isRefreshing = false; });
    });
  }
  return Promise.reject(error);
});
