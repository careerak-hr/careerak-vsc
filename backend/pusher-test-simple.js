/**
 * اختبار Pusher البسيط - كما طلب موقع Pusher
 * تشغيل: node pusher-test-simple.js
 */

require('dotenv').config();
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "2116650",
  key: "e1634b67b9768369c949",
  secret: "6cc69e70fd3118893c6c",
  cluster: "ap1",
  useTLS: true
});

console.log('🚀 إرسال رسالة تجريبية إلى Pusher...\n');

pusher.trigger("my-channel", "my-event", {
  message: "hello world"
})
.then(() => {
  console.log('✅ تم إرسال الرسالة بنجاح!');
  console.log('📡 القناة: my-channel');
  console.log('🎯 الحدث: my-event');
  console.log('💬 الرسالة: hello world');
  console.log('');
  console.log('📱 الآن افتح تطبيق Android وراقب Logcat');
  console.log('   يجب أن ترى: "Received event with data: ..."');
  console.log('');
  console.log('🌐 أو افتح Pusher Debug Console:');
  console.log('   https://dashboard.pusher.com/apps/2116650/getting_started');
  console.log('');
})
.catch((error) => {
  console.error('❌ فشل إرسال الرسالة:', error.message);
  console.error('');
  console.error('💡 تحقق من:');
  console.error('   1. المفاتيح صحيحة في الكود');
  console.error('   2. الإنترنت متصل');
  console.error('   3. Pusher App مفعّل');
  console.error('');
});
