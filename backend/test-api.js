/**
 * اختبار API بسيط لتفعيل اتصال MongoDB
 * تشغيل: node test-api.js (بعد تشغيل npm start)
 */

const http = require('http');

console.log('🧪 اختبار API واتصال MongoDB...\n');

// إرسال طلب بسيط لتفعيل اتصال MongoDB
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/users',
  method: 'GET'
};

console.log('📡 إرسال طلب إلى: http://localhost:5000/users');
console.log('   (هذا سيفعّل اتصال MongoDB تلقائياً)\n');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ تم استقبال الرد من Backend');
    console.log('📊 Status Code:', res.statusCode);
    console.log('');
    
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log('🎉 Backend يعمل بنجاح!');
      console.log('');
      console.log('💡 الآن راجع terminal الخاص بـ npm start');
      console.log('   يجب أن ترى: "✅ MongoDB connected (first request)"');
      console.log('');
    } else {
      console.log('⚠️ Status Code غير متوقع:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ في الاتصال:', error.message);
  console.error('');
  console.error('💡 تأكد من:');
  console.error('   1. Backend يعمل: npm start');
  console.error('   2. المنفذ 5000 متاح');
  console.error('');
});

req.end();
