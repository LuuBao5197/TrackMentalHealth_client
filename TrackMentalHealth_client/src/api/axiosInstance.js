import axios from 'axios';
import { store } from '../redux/store';
import { setCredentials, logout } from '../redux/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Cho phép gửi HttpOnly Cookie
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post('/auth/refresh');
        store.dispatch(setCredentials({
          accessToken: res.data.accessToken,
          user: store.getState().auth.user,
        }));
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (e) {
        store.dispatch(logout());
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
