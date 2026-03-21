# LinkedIn API - مرجع سريع ⚡

## 🔑 الحصول على المفاتيح (دقيقتان)

1. **اذهب إلى**: https://www.linkedin.com/developers/
2. **أنشئ تطبيق**: Create app → املأ المعلومات
3. **انسخ المفاتيح**: Auth tab → Client ID + Client Secret

---

## 📝 إضافة في .env (30 ثانية)

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin/callback
FRONTEND_URL=http://localhost:3000
```

---

## 🔗 Redirect URLs المطلوبة

في LinkedIn App → Auth tab → Authorized redirect URLs:

```
http://localhost:3000/linkedin/callback
https://careerak.com/linkedin/callback
```

---

## 📦 الصلاحيات المطلوبة

في LinkedIn App → Products tab:

- ✅ Sign In with LinkedIn using OpenID Connect
- ✅ Share on LinkedIn

---

## 🧪 اختبار سريع

```bash
# 1. إعادة تشغيل السيرفر
npm run dev

# 2. افتح المتصفح
http://localhost:3000

# 3. اذهب إلى الإعدادات → ربط LinkedIn
```

---

## 🐛 أخطاء شائعة

| الخطأ | الحل |
|-------|------|
| Invalid redirect_uri | تحقق من Redirect URLs في LinkedIn App |
| Invalid client_id | انسخ Client ID مرة أخرى |
| Access denied | فعّل الصلاحيات في Products tab |

---

## 📚 التوثيق الكامل

- 📄 `docs/LINKEDIN_SETUP_GUIDE.md` - دليل مفصل خطوة بخطوة
- 📄 `docs/LINKEDIN_INTEGRATION.md` - دليل شامل للتكامل
- 📄 `docs/LINKEDIN_INTEGRATION_QUICK_START.md` - دليل البدء السريع

---

**تاريخ الإنشاء**: 2026-03-13
