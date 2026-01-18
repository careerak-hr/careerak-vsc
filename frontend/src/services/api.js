import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

// ✅ الرابط العالمي النهائي (مباشرة وبدون تعقيد)
const GLOBAL_SERVER = 'https://careerak-vsc-lj8x.vercel.app/api';

const api = axios.create({
  baseURL: GLOBAL_SERVER,
  timeout: 30000, // زيادة وقت الانتظار لـ 30 ثانية
  headers: {
    'Content-Type': 'application/json',
  },
});

// دالة بسيطة للاختبار
export const discoverBestServer = async () => {
  try {
    const res = await axios.get(`${GLOBAL_SERVER}/users/health-check`, { timeout: 10000 });
    console.log("Global Server is Alive!");
    return GLOBAL_SERVER;
  } catch (e) {
    console.error("Global Server Connection Failed:", e.message);
    return GLOBAL_SERVER;
  }
};

export default api;
