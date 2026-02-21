import axios from 'axios';
import { staleWhileRevalidate } from '../utils/apiCache';
import { queueRequest, RequestPriority } from '../utils/offlineRequestQueue';
import { createAxiosErrorHandler } from '../utils/networkErrorHandler';

// تحميل monitoring بشكل آمن
// مراقب الأداء (تعليق لتجنب تحذير ESLint)
// eslint-disable-next-line no-unused-vars
let performanceMonitor = null;
let trackApiCall = null;
let logError = null;

try {
  const monitoring = require('../utils/monitoring');
  trackApiCall = monitoring.trackApiCall;
  logError = monitoring.logError;
} catch (error) {
  console.warn('Performance monitoring not available:', error.message);
  // إنشاء دوال بديلة فارغة
  trackApiCall = () => {};
  logError = () => {};
}

// ✅ استخدام متغير البيئة مع fallback للرابط المستقر
const BASE_URL = import.meta.env.VITE_API_URL || 'https://careerak-vsc.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// 📊 Interceptor لتتبع الأداء وإضافة Token
api.interceptors.request.use(
  (config) => {
    // إضافة وقت بداية الطلب
    config.metadata = { startTime: Date.now() };
    
    // ✅ إضافة token من localStorage إذا كان موجوداً
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    if (logError) {
      logError({
        type: 'API Request Error',
        message: error.message,
        config: error.config,
        timestamp: Date.now()
      });
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // حساب مدة الطلب
    const duration = Date.now() - response.config.metadata.startTime;
    
    // تتبع استدعاء API ناجح
    if (trackApiCall) {
      trackApiCall(
        response.config.method.toUpperCase(),
        response.config.url,
        duration,
        response.status
      );
    }
    
    return response;
  },
  createAxiosErrorHandler({
    language: 'ar', // Default language, can be overridden
    onError: (networkError) => {
      // Additional error handling if needed
      console.log('[API] Network error processed:', networkError.type);
    }
  })
);

export const discoverBestServer = async () => {
  // إرجاع Promise محلول مباشرة
  return Promise.resolve(BASE_URL);
};

/**
 * Make a cached GET request with stale-while-revalidate strategy
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} config - Axios config + cache options
 * @param {number} config.maxAge - Cache max age in milliseconds (default: 5 minutes)
 * @param {boolean} config.forceRefresh - Force refresh ignoring cache
 * @returns {Promise} Promise that resolves with the response data
 */
export const getCached = async (url, config = {}) => {
  const { maxAge, forceRefresh, ...axiosConfig } = config;
  
  const fetchFn = () => api.get(url, axiosConfig).then(res => res.data);
  
  return staleWhileRevalidate(fetchFn, {
    maxAge,
    forceRefresh,
    cacheKey: { method: 'GET', url, params: axiosConfig.params }
  });
};

/**
 * Make a cached POST request with stale-while-revalidate strategy
 * Note: Use with caution - POST requests are typically not cacheable
 * Only use for idempotent POST requests that fetch data
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @param {Object} config - Axios config + cache options
 * @returns {Promise} Promise that resolves with the response data
 */
export const postCached = async (url, data, config = {}) => {
  const { maxAge, forceRefresh, ...axiosConfig } = config;
  
  const fetchFn = () => api.post(url, data, axiosConfig).then(res => res.data);
  
  return staleWhileRevalidate(fetchFn, {
    maxAge,
    forceRefresh,
    cacheKey: { method: 'POST', url, data, params: axiosConfig.params }
  });
};

/**
 * Update the language for network error messages
 * 
 * @param {string} language - Language code ('ar', 'en', 'fr')
 */
export const updateApiLanguage = (language) => {
  // Remove existing response interceptor
  api.interceptors.response.eject(api.interceptors.response.handlers.length - 1);
  
  // Add new response interceptor with updated language
  api.interceptors.response.use(
    (response) => {
      // حساب مدة الطلب
      const duration = Date.now() - response.config.metadata.startTime;
      
      // تتبع استدعاء API ناجح
      if (trackApiCall) {
        trackApiCall(
          response.config.method.toUpperCase(),
          response.config.url,
          duration,
          response.status
        );
      }
      
      return response;
    },
    createAxiosErrorHandler({
      language,
      onError: (networkError) => {
        // Additional error handling if needed
        console.log('[API] Network error processed:', networkError.type);
      }
    })
  );
};

export default api;
