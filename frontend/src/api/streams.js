import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getStreams = (liveOnly = false) =>
  API.get(`/streams/${liveOnly ? '?live=1' : ''}`);

export const getStream = (id) => API.get(`/streams/${id}/`);

export const createStream = (data) => API.post('/streams/create/', data);

export const deleteStream = (id) => API.delete(`/streams/${id}/delete/`);

export const regenerateKey = (id) => API.post(`/streams/${id}/regenerate-key/`);
