import axios from 'axios';

// ✅ الرابط الرئيسي والثابت للمشروع على Vercel (Production Domain)
const BASE_URL = 'https://careerak-vsc.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// دالة الاكتشاف الموحدة
export const discoverBestServer = async () => {
  return BASE_URL;
};

export default api;
