/**
 * PM2 Configuration
 * لتشغيل Backend بشكل دائم ومستمر
 */

module.exports = {
  apps: [{
    name: 'careerak-backend',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    
    // إعادة التشغيل التلقائي
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    
    // مراقبة الأداء
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // إعادة التشغيل عند تحديث الملفات (اختياري)
    // watch: ['src'],
    // ignore_watch: ['node_modules', 'logs', 'uploads'],
    
    // Cron لإعادة التشغيل اليومي (اختياري)
    // cron_restart: '0 0 * * *', // كل يوم الساعة 12 صباحاً
  }]
};
