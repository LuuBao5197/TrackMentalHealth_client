// src/api/diaryApi.js
import axios from 'axios';
import getAuthHeaders from './baseAPI';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/users`;


export const getUserInfo = (id) => {
  return axios.get(`${API_URL}/profile/${id}`, getAuthHeaders());
};

