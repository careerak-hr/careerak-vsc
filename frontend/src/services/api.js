import axios from 'axios';

// ✅ الرابط الأساسي نظيف وبدون سلاش في النهاية
const BASE_URL = 'https://careerak-vsc-lj8x.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// ✅ إعادة تصدير الدالة لتجنب أخطاء الاستيراد في App.jsx و EntryPage
export const discoverBestServer = async () => {
  return BASE_URL;
};

export default api;
