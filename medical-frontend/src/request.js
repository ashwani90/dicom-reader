import api from './api';

/**
 * Generic API request handler
 * @param {string} method - HTTP method ('get', 'post', 'put', 'delete', etc.)
 * @param {string} url - endpoint path (relative to baseURL or full URL)
 * @param {object|FormData|null} data - request body (optional)
 * @param {object} config - additional Axios config (optional)
 */
export const sendRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      ...config, // allows overrides like headers, params, etc.
    });
    return response;
  } catch (error) {
    console.error(`Request failed [${method.toUpperCase()} ${url}]:`, error);
    throw error;
  }
};
