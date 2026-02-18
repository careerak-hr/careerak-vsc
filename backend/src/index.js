// ✅ هذا الملف يعمل في بيئتين:
// 1. Vercel Serverless (يصدّر app فقط)
// 2. Local/PM2 (يشغل app.listen)

const app = require('./app');
const pusherService = require('./services/pusherService');
const logger = require('./utils/logger');

// تهيئة Pusher للمحادثات الفورية
const pusherInitialized = pusherService.initialize();

// اختبار Pusher (فقط في Development)
if (pusherInitialized && process.env.NODE_ENV === 'development') {
  // إرسال رسالة تجريبية بعد 3 ثواني من التشغيل
  setTimeout(() => {
    const Pusher = require('pusher');
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || 'ap1',
      useTLS: true
    });
    
    pusher.trigger('my-channel', 'my-event', {
      message: 'hello world',
      timestamp: new Date().toISOString()
    })
    .then(() => {
      logger.info('🧪 Pusher test message sent successfully to my-channel');
    })
    .catch((error) => {
      logger.error('❌ Pusher test message failed:', error.message);
    });
  }, 3000);
}

// 🚀 تشغيل السيرفر محلياً (لـ PM2 والتطوير المحلي)
// في Vercel، هذا الكود لن يُنفذ لأن Vercel يستخدم app مباشرة
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    logger.info(`🚀 Careerak Backend running on port ${PORT}`);
    logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📡 Pusher: ${pusherInitialized ? 'Enabled' : 'Disabled'}`);
    logger.info(`🗄️ MongoDB: Will connect on first request`);
    console.log(`\n✅ Server is ready at http://localhost:${PORT}\n`);
  });
}

module.exports = app;
