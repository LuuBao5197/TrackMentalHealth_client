// src/api/diaryApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/diaries';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDiaries = () => {
  return axios.get(API_URL, getAuthHeaders());
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
