import axios from 'axios';

// ✅ استخدام متغير البيئة مع fallback للرابط المستقر
const BASE_URL = process.env.REACT_APP_API_URL || 'https://careerak-vsc.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

export const discoverBestServer = async () => {
  return BASE_URL;
};

export default api;
