import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const axios = Axios.create({
  // Pastikan URL di Environment Variable Vercel (FE) sudah mengarah ke Koyeb
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  timeout: 60000, 
});

// --- REQUEST INTERCEPTOR (Tetap sama) ---
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// --- RESPONSE INTERCEPTOR (Bersih & Standar) ---
axios.interceptors.response.use(
  (response: AxiosResponse) => response, // Langsung kembalikan respon
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout - Server Koyeb tidak merespon');
    } else if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    } else if (!error.response) {
      console.error('❌ Network Error - Cek koneksi internet atau CORS');
    }
    return Promise.reject(error);
  }
);

export default axios;