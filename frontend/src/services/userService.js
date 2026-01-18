import api from './api';

const userService = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  verifyOTP: (data) => api.post('/users/verify-otp', data),
  updateProfile: (data) => api.put('/users/profile', data),
  parseCV: (data) => api.post('/users/parse-cv', data),

  // AI and Social Parsing - Placeholders if not yet implemented in backend
  analyzeImage: (data) => api.post('/users/analyze-image', data),
  parseSocial: (data) => api.post('/users/parse-social', data),
};

export default userService;
