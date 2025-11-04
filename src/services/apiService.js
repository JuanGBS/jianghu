import axios from 'axios';

const API_BASE_URL = 'https://discomfortingly-increasing-kenya.ngrok-free.dev'; 
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use(config => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }

  config.headers['ngrok-skip-browser-warning'] = 'true';

  return config;
}, error => {
  return Promise.reject(error);
});

export const registerUser = (username, password) => api.post('/auth/register', { username, password });
export const loginUser = (username, password) => api.post('/auth/login', { username, password });

export const getCharacter = () => api.get('/character');
export const createCharacter = (characterData) => api.post('/character', characterData);
export const updateCharacter = (characterData) => api.put('/character', characterData);
export const deleteCharacter = () => api.delete('/character');