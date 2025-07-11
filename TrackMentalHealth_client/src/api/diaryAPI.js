// src/api/diaryApi.js
import axios from 'axios';

const API_URL = 'http://localhost:9999/api/diaries';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// ✅ Đúng: gọi /api/diaries/my
export const getDiaries = () => {
  return axios.get(`${API_URL}/my`, getAuthHeaders());
};


export const createDiary = (diary) => {
  return axios.post(API_URL, diary, getAuthHeaders());
};

export const updateDiary = (id, diary) => {
  return axios.put(`${API_URL}/${id}`, diary, getAuthHeaders());
};

export const deleteDiary = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};
