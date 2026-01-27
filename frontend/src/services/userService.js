import api from './api';

// ✅ المسارات مطابقة تماماً لما يتوقعه السيرفر في Vercel
const userService = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  verifyOTP: (data) => api.post('/users/verify-otp', data),
  updateProfile: (data) => api.put('/users/profile', data),
  getUserProfile: () => api.get('/users/profile'),
  analyzeImage: (data) => api.post('/users/analyze-image', data),
  generateCv: (data) => api.post('/users/generate-cv', data),
  parseCV: (data) => api.post('/users/parse-cv', data),
};

export default userService;
