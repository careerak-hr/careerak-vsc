import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

// عناوين احتياطية
const LOCAL_SERVER = 'http://192.168.1.5:5000/api';
const TUNNEL_BRIDGE = 'https://careerak-server.loca.lt/api';
const BOOTSTRAP_URL =
  'https://bootstrab-vercel-a3w37so3b-careeraks-projects.vercel.app/api/bootstrap';

// ✅ تعريف واحد فقط
const api = axios.create({
  baseURL: LOCAL_SERVER,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// اكتشاف أفضل سيرفر
export const discoverBestServer = async () => {
  try {
    // 1️⃣ جرّب المحفوظ
    const { value: cached } = await Preferences.get({ key: 'cached_api_url' });
    if (cached) {
      try {
        await axios.get(`${cached}/users/health-check`, { timeout: 3000 });
        api.defaults.baseURL = cached;
        return cached;
      } catch {}
    }

    // 2️⃣ جرّب المحلي / النفق
    const servers = [LOCAL_SERVER, TUNNEL_BRIDGE];
    for (const url of servers) {
      try {
        await axios.get(`${url}/users/health-check`, { timeout: 3000 });
        api.defaults.baseURL = url;
        await Preferences.set({ key: 'cached_api_url', value: url });
        return url;
      } catch {}
    }

    // 3️⃣ Bootstrap
    const res = await axios.get(BOOTSTRAP_URL, { timeout: 5000 });
    if (res.data?.apiBaseUrl) {
      api.defaults.baseURL = res.data.apiBaseUrl;
      await Preferences.set({
        key: 'cached_api_url',
        value: res.data.apiBaseUrl,
      });
      return res.data.apiBaseUrl;
    }
  } catch (e) {
    console.error('Server discovery failed', e);
  }

  return api.defaults.baseURL;
};

// إعادة الاكتشاف عند فشل الشبكة
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response && !original._retry) {
      original._retry = true;
      await Preferences.remove({ key: 'cached_api_url' });
      const newURL = await discoverBestServer();
      if (newURL) {
        original.baseURL = newURL;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

// ✅ هذا هو التصدير الوحيد
export default api;
