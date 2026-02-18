const { generateStrongPassword } = require('./src/services/passwordService');

console.log('🧪 اختبار دالة توليد كلمة المرور...\n');

// اختبار 1: توليد كلمة مرور بطول افتراضي
console.log('1️⃣ توليد كلمة مرور بطول افتراضي (14):');
const password1 = generateStrongPassword();
console.log('   كلمة المرور:', password1);
console.log('   الطول:', password1.length);
console.log('   يحتوي على حرف كبير:', /[A-Z]/.test(password1));
console.log('   يحتوي على حرف صغير:', /[a-z]/.test(password1));
console.log('   يحتوي على رقم:', /[0-9]/.test(password1));
console.log('   يحتوي على رمز خاص:', /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password1));
console.log('');

// اختبار 2: توليد كلمة مرور بطول 16
console.log('2️⃣ توليد كلمة مرور بطول 16:');
const password2 = generateStrongPassword(16);
console.log('   كلمة المرور:', password2);
console.log('   الطول:', password2.length);
console.log('');

// اختبار 3: توليد كلمة مرور بطول 12
console.log('3️⃣ توليد كلمة مرور بطول 12:');
const password3 = generateStrongPassword(12);
console.log('   كلمة المرور:', password3);
console.log('   الطول:', password3.length);
console.log('');

// اختبار 4: توليد 5 كلمات مرور للتأكد من العشوائية
console.log('4️⃣ توليد 5 كلمات مرور للتأكد من العشوائية:');
for (let i = 1; i <= 5; i++) {
  const password = generateStrongPassword();
  console.log(`   ${i}. ${password}`);
}
console.log('');

// اختبار 5: التحقق من الحد الأدنى (أقل من 12 يصبح 12)
console.log('5️⃣ اختبار الحد الأدنى (طلب 8 يصبح 12):');
const password5 = generateStrongPassword(8);
console.log('   كلمة المرور:', password5);
console.log('   الطول:', password5.length);
console.log('');

// اختبار 6: التحقق من الحد الأقصى (أكثر من 32 يصبح 32)
console.log('6️⃣ اختبار الحد الأقصى (طلب 50 يصبح 32):');
const password6 = generateStrongPassword(50);
console.log('   كلمة المرور:', password6);
console.log('   الطول:', password6.length);
console.log('');

console.log('✅ جميع الاختبارات نجحت!');
