/**
 * اختبار سريع لـ Pusher
 * تشغيل: node test-pusher.js
 */

require('dotenv').config();
const Pusher = require('pusher');

console.log('🧪 اختبار Pusher...\n');

// التحقق من المفاتيح
console.log('📋 المفاتيح:');
console.log('  App ID:', process.env.PUSHER_APP_ID);
console.log('  Key:', process.env.PUSHER_KEY);
console.log('  Secret:', process.env.PUSHER_SECRET ? '***' : 'غير موجود');
console.log('  Cluster:', process.env.PUSHER_CLUSTER);
console.log('');

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
  console.error('❌ المفاتيح غير موجودة في .env');
  process.exit(1);
}

// تهيئة Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

console.log('✅ Pusher initialized successfully\n');

// اختبار 1: إرسال حدث بسيط
console.log('🧪 اختبار 1: إرسال حدث بسيط...');
pusher.trigger('my-channel', 'my-event', {
  message: 'Hello from Pusher!',
  timestamp: new Date().toISOString()
})
.then(() => {
  console.log('✅ تم إرسال الحدث بنجاح');
  console.log('   القناة: my-channel');
  console.log('   الحدث: my-event');
  console.log('');
  
  // اختبار 2: إرسال رسالة محادثة
  console.log('🧪 اختبار 2: إرسال رسالة محادثة...');
  return pusher.trigger('conversation-test123', 'new-message', {
    message: {
      _id: 'msg_' + Date.now(),
      content: 'مرحباً! هذه رسالة تجريبية من Pusher',
      sender: 'test_user',
      timestamp: new Date().toISOString()
    }
  });
})
.then(() => {
  console.log('✅ تم إرسال رسالة المحادثة بنجاح');
  console.log('   القناة: conversation-test123');
  console.log('   الحدث: new-message');
  console.log('');
  
  // اختبار 3: إرسال مؤشر "يكتب الآن"
  console.log('🧪 اختبار 3: إرسال مؤشر "يكتب الآن"...');
  return pusher.trigger('conversation-test123', 'user-typing', {
    userId: 'test_user',
    userName: 'مستخدم تجريبي',
    timestamp: new Date().toISOString()
  });
})
.then(() => {
  console.log('✅ تم إرسال مؤشر الكتابة بنجاح');
  console.log('   القناة: conversation-test123');
  console.log('   الحدث: user-typing');
  console.log('');
  
  // اختبار 4: إرسال إشعار
  console.log('🧪 اختبار 4: إرسال إشعار...');
  return pusher.trigger('private-user-123', 'notification', {
    type: 'job_match',
    title: 'وظيفة جديدة مناسبة لك!',
    message: 'تم نشر وظيفة تطابق مهاراتك',
    timestamp: new Date().toISOString()
  });
})
.then(() => {
  console.log('✅ تم إرسال الإشعار بنجاح');
  console.log('   القناة: private-user-123');
  console.log('   الحدث: notification');
  console.log('');
  
  // اختبار 5: الحصول على معلومات القناة
  console.log('🧪 اختبار 5: الحصول على معلومات القناة...');
  return pusher.get({ path: '/channels/my-channel' });
})
.then((response) => {
  console.log('✅ تم الحصول على معلومات القناة');
  console.log('   الحالة:', response.status);
  console.log('');
  
  console.log('🎉 جميع الاختبارات نجحت!\n');
  console.log('📱 الآن يمكنك:');
  console.log('   1. تشغيل Backend: npm start');
  console.log('   2. بناء Android APK: build_careerak_optimized.bat');
  console.log('   3. فتح Pusher Debug Console: https://dashboard.pusher.com/apps/2116650/getting_started');
  console.log('   4. مراقبة الأحداث في Logcat');
  console.log('');
})
.catch((error) => {
  console.error('❌ خطأ في الاختبار:', error.message);
  console.error('');
  console.error('💡 تحقق من:');
  console.error('   1. المفاتيح في .env صحيحة');
  console.error('   2. الإنترنت متصل');
  console.error('   3. Pusher App مفعّل في Dashboard');
  console.error('');
  process.exit(1);
});
