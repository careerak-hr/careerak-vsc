import api from './api';

// ✅ تصحيح المسارات لتطابق الهيكلية الجديدة في Vercel
// السيرفر مبرمج لاستقبال /api/users/register
const userService = {
  register: (data) => api.post('/api/users/register', data),
  login: (data) => api.post('/api/users/login', data),
  verifyOTP: (data) => api.post('/api/users/verify-otp', data),
  updateProfile: (data) => api.put('/api/users/profile', data),
  parseCV: (data) => api.post('/api/users/parse-cv', data),
  analyzeImage: (data) => api.post('/api/users/analyze-image', data),
  getAIRecommendations: (data) => api.get('/api/users/ai-recommendations', data),
};

export default userService;
