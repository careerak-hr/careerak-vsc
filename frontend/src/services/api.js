import axios from 'axios';

// ✅ الرابط الحقيقي والمؤكد الذي يعمل على Vercel حالياً
const BASE_URL = 'https://careerak-b132tuqlg-careeraks-projects.vercel.app';

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
