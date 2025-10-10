import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true, // important to send/receive cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;