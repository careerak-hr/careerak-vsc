// ملف خاص للتطوير المحلي مع Socket.IO
// لا يُستخدم في Vercel (يستخدم src/index.js)

const http = require('http');
const app = require('./src/app');
const socketService = require('./src/services/socketService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// إنشاء HTTP server
const server = http.createServer(app);

// تهيئة Socket.IO
socketService.initialize(server);

// تشغيل السيرفر
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO enabled for real-time chat`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// معالجة الأخطاء
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    logger.error('Server error:', error);
  }
});

// معالجة إيقاف التشغيل
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
