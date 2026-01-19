import axios from 'axios';

// ✅ استخدام الرابط المستقر والناجح الذي أكدنا عمله
const BASE_URL = 'https://careerak-vsc.vercel.app';

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
