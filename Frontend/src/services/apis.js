import axios from "axios";

export const API = axios.create({
  baseURL: "https://real-time-code-editor-as44.onrender.com/api",
  withCredentials: true,
});

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});