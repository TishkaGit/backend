import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://backend-etqm.onrender.com', // твой backend
});

// добавляем токен автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});