import api from './api';

// ✅ التأكد من أن جميع المسارات تبدأ بـ /api/ لضمان الوصول للسيرفر السحابي
const userService = {
  register: (data) => api.post('/api/users/register', data),
  login: (data) => api.post('/api/users/login', data),
  verifyOTP: (data) => api.post('/api/users/verify-otp', data),
  updateProfile: (data) => api.put('/api/users/profile', data),
  parseCV: (data) => api.post('/api/users/parse-cv', data),
  analyzeImage: (data) => api.post('/api/users/analyze-image', data),
  parseSocial: (data) => api.post('/api/users/parse-social', data),
};

export default userService;
