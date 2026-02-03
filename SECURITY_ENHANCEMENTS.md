# 🔒 تحسينات أمنية متقدمة لـ Careerak

## 1. حماية متقدمة ضد هجمات CSRF
```javascript
// frontend/src/utils/csrfProtection.js
export const generateCSRFToken = () => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};
```

## 2. تشفير البيانات الحساسة
```javascript
// frontend/src/utils/encryption.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

## 3. حماية ضد XSS
```javascript
// frontend/src/utils/sanitizer.js
import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html);
};
```

## 4. Rate Limiting للـ API
```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  loginLimiter: createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts'),
  registerLimiter: createRateLimiter(60 * 60 * 1000, 3, 'Too many registration attempts'),
  generalLimiter: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests')
};
```