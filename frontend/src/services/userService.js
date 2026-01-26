import api from './api';

// ✅ المسارات مطابقة تماماً لما يتوقعه السيرفر في Vercel
const userService = {
  register: (data) => api.post('/api/users/register', data),
  login: (data) => api.post('/api/users/login', data),
  verifyOTP: (data) => api.post('/api/users/verify-otp', data),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getUserProfile: () => api.get('/api/users/profile'),
  analyzeImage: (data) => api.post('/api/users/analyze-image', data),
  generateCv: (data) => api.post('/api/users/generate-cv', data), // <-- الدالة الجديدة
  parseCV: (data) => api.post('/api/users/parse-cv', data),
};

export default userService;
