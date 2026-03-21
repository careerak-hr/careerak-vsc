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

// تحميل monitoring بشكل غير متزامن (dynamic import للبيئة ESM)
import('../utils/monitoring')
  .then((monitoring) => {
    trackApiCall = monitoring.trackApiCall;
    logError = monitoring.logError;
  })
  .catch(() => {
    // monitoring غير متاح - الدوال البديلة الفارغة تبقى كما هي
  });

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
  (error) => {
    // Requirement 11.9: Handle session expiration
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized (session expired or invalid token)
      if (status === 401) {
        const errorCode = data?.code;
        
        // Check if it's a session expiration
        if (errorCode === 'SESSION_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'AUTHENTICATION_FAILED') {
          // Clear authentication data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Store the current path to redirect back after login
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/auth') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          // Show session expired message
          const message = errorCode === 'SESSION_EXPIRED' 
            ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            : 'جلسة غير صالحة، يرجى إعادة تسجيل الدخول';
          
          // Dispatch custom event for session expiration
          window.dispatchEvent(new CustomEvent('sessionExpired', { 
            detail: { message, code: errorCode } 
          }));
          
          // Redirect to login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/auth') {
            window.location.href = '/login?session=expired';
          }
        }
      }
      
      // Handle 403 Forbidden (insufficient permissions)
      if (status === 403) {
        const errorCode = data?.code;
        
        if (errorCode === 'INSUFFICIENT_PERMISSIONS') {
          // Dispatch custom event for insufficient permissions
          window.dispatchEvent(new CustomEvent('insufficientPermissions', { 
            detail: { 
              message: data.error,
              requiredRoles: data.requiredRoles,
              userRole: data.userRole
            } 
          }));
        }
      }
    }
    
    // Continue with the existing error handler
    return createAxiosErrorHandler({
      language: 'ar',
      onError: (networkError) => {
        console.log('[API] Network error processed:', networkError.type);
      }
    })(error);
  }
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
