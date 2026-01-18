import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

// ✅ الرابط العالمي الجديد المرفوع على Vercel
const GLOBAL_SERVER = 'https://careerak-vsc-lj8x.vercel.app/api';

// عناوين احتياطية (للمطورين فقط)
const LOCAL_SERVER = 'http://192.168.1.5:5000/api';

const api = axios.create({
  baseURL: GLOBAL_SERVER, // جعل الرابط العالمي هو الخيار الأول والأساسي
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// اكتشاف أفضل سيرفر (نظام ذكي لضمان استمرارية العمل)
export const discoverBestServer = async () => {
  try {
    // 1️⃣ جرّب الرابط العالمي أولاً
    try {
      await axios.get(`${GLOBAL_SERVER}/users/health-check`, { timeout: 5000 });
      api.defaults.baseURL = GLOBAL_SERVER;
      await Preferences.set({ key: 'cached_api_url', value: GLOBAL_SERVER });
      return GLOBAL_SERVER;
    } catch (e) {
      console.log("Global server not reachable, trying alternates...");
    }

    // 2️⃣ جرّب المحفوظ سابقاً
    const { value: cached } = await Preferences.get({ key: 'cached_api_url' });
    if (cached) {
      try {
        await axios.get(`${cached}/users/health-check`, { timeout: 3000 });
        api.defaults.baseURL = cached;
        return cached;
      } catch {}
    }

    // 3️⃣ جرّب المحلي (في حال كان المطور يعمل محلياً)
    try {
      await axios.get(`${LOCAL_SERVER}/users/health-check`, { timeout: 3000 });
      api.defaults.baseURL = LOCAL_SERVER;
      return LOCAL_SERVER;
    } catch {}

  } catch (e) {
    console.error('Server discovery failed', e);
  }

  return api.defaults.baseURL;
};

// التصدير الافتراضي
export default api;
