// src/api/moodAPI.js
import axios from "axios";

const API_URL = "http://localhost:9999/api/moods";
const MOOD_LEVEL_URL = "http://localhost:9999/api/mood-levels";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// Lấy danh sách cấp độ cảm xúc
export const getMoodLevels = () => {
  return axios.get(MOOD_LEVEL_URL, getAuthHeaders());
};

// Lấy cảm xúc hôm nay của user đang đăng nhập
export const getTodayMood = () => {
  return axios.get(`${API_URL}/my/today`, getAuthHeaders());
};

// Tạo mới mood
export const createMood = (data) => {
  return axios.post(API_URL, data, getAuthHeaders());
};

// Cập nhật mood
export const updateMood = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
};

// (Không cần dùng nếu dùng getTodayMood thay thế)
export const getMoodByUserAndDate = (userId, date) => {
  return axios.get(`${API_URL}/user/${userId}/date/${date}`, getAuthHeaders());
};
// Lấy tất cả cảm xúc của user đang đăng nhập (lịch sử mood)
export const getMyMoods = () => {
  return axios.get(`${API_URL}/my`, getAuthHeaders());
};
// ✅ Lấy cảm xúc có phân trang
export const getMyMoodsPaged = (page = 0, size = 5) => {
  return axios.get(`${API_URL}/my/page?page=${page}&size=${size}`, getAuthHeaders());
};


// Lấy thống kê biểu đồ cảm xúc theo user đang đăng nhập
export const getMoodStatistics = () => {
  return axios.get(`${API_URL}/my/statistics`, getAuthHeaders());
};

