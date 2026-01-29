/**
 * Test Build Script
 * سكريبت اختبار البناء
 */

console.log('🧪 Testing build configuration...');

// اختبار متغيرات البيئة
console.log('Environment:', process.env.NODE_ENV);
console.log('Debug Mode:', process.env.REACT_APP_DEBUG_MODE);

// اختبار التحميل الشرطي
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Development mode detected');
} else {
  console.log('🏭 Production mode detected');
}

console.log('✅ Build test completed');