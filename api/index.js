// ✅ هذا الملف هو نقطة الدخول الرسمية لـ Vercel
// يقوم بتوجيه الطلبات إلى السيرفر الحقيقي الموجود في مجلد backend
const app = require('../backend/src/index.js');

module.exports = app;
