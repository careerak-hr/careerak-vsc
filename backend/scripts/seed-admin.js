/**
 * سكريبت رفع حساب الأدمن إلى MongoDB
 * 
 * الاستخدام:
 *   node scripts/seed-admin.js
 * 
 * يقرأ البيانات من .env ويرفع حساب الأدمن إلى قاعدة البيانات.
 * إذا كان الحساب موجوداً يُحدّثه، وإذا لم يكن موجوداً يُنشئه.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI غير محدد في .env');
  process.exit(1);
}

// بيانات الأدمن من .env مع fallback للقيم الافتراضية
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || process.env.ADMIN_USERNAME || 'admin01';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PHONE    = process.env.ADMIN_PHONE    || '+966000000000';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Master Admin';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ متصل بـ MongoDB');

    // استخدام النموذج مباشرة بدون discriminator لتجنب تعارض التسجيل
    const User = require('../src/models/User').User;

    const existing = await User.findOne({ role: 'Admin' });

    if (existing) {
      // تحديث كلمة المرور فقط إذا تغيّرت
      const isSame = await bcrypt.compare(ADMIN_PASSWORD, existing.password);
      if (!isSame) {
        existing.password = ADMIN_PASSWORD; // سيُشفَّر تلقائياً بـ pre-save hook
        await existing.save();
        console.log('✅ تم تحديث كلمة مرور الأدمن في MongoDB');
      } else {
        console.log('ℹ️  حساب الأدمن موجود بالفعل ولا يحتاج تحديث');
      }
      console.log(`   Email/Username: ${existing.email || existing.phone}`);
    } else {
      // إنشاء حساب أدمن جديد
      // نستخدم User الأساسي (ليس Individual أو Company)
      const adminData = {
        email: ADMIN_EMAIL.includes('@') ? ADMIN_EMAIL.toLowerCase() : undefined,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE,
        role: 'Admin',
        country: 'SA',
        isVerified: true,
        emailVerified: true,
        userType: 'Employee', // discriminator مطلوب
        firstName: ADMIN_NAME.split(' ')[0],
        lastName: ADMIN_NAME.split(' ').slice(1).join(' ') || 'Admin',
      };

      // إذا كان ADMIN_EMAIL ليس بريداً إلكترونياً، نضعه كـ phone fallback
      if (!ADMIN_EMAIL.includes('@')) {
        adminData.phone = ADMIN_PHONE;
      }

      const { Individual } = require('../src/models/User');
      const admin = new Individual(adminData);
      await admin.save();
      console.log('✅ تم إنشاء حساب الأدمن في MongoDB بنجاح');
      console.log(`   Email: ${adminData.email || 'غير محدد'}`);
      console.log(`   Phone: ${adminData.phone}`);
      console.log(`   Role:  Admin`);
    }

    console.log('\n⚠️  تذكير: غيّر كلمة المرور الافتراضية قبل الإنتاج!');
  } catch (err) {
    if (err.message.includes('whitelist') || err.message.includes('IP') || err.message.includes('ECONNREFUSED') || err.message.includes('servers')) {
      console.error('❌ تعذّر الاتصال بـ MongoDB Atlas');
      console.error('');
      console.error('📋 الحل: أضف IP الجهاز الحالي إلى Atlas Whitelist:');
      console.error('   1. اذهب إلى: https://cloud.mongodb.com');
      console.error('   2. Security → Network Access → Add IP Address');
      console.error('   3. أضف IP الحالي أو اختر "Allow Access from Anywhere" (0.0.0.0/0) للتطوير');
      console.error('   4. أعد تشغيل: npm run seed:admin');
    } else {
      console.error('❌ خطأ:', err.message);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بـ MongoDB');
  }
}

seedAdmin();
