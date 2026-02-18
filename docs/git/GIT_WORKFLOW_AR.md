# دليل استخدام Git - Careerak

## نظرة عامة

هذا الدليل يشرح كيفية استخدام Git لإدارة التغييرات في مشروع Careerak.

## الإعداد الأولي

### 1. التحقق من تثبيت Git

```cmd
git --version
```

إذا لم يكن مثبتًا، حمّله من: https://git-scm.com/download/win

### 2. إعداد Git

```cmd
setup_git.bat
```

هذا الملف سيساعدك في:
- ✅ تعيين اسمك (user.name)
- ✅ تعيين بريدك الإلكتروني (user.email)
- ✅ إعداد الفرع الافتراضي
- ✅ إعداد نهايات الأسطر

## سير العمل اليومي

### الطريقة السريعة (موصى بها)

```cmd
git_commit_push.bat
```

هذا الملف سيقوم بـ:
1. ✅ التحقق من إعدادات Git
2. ✅ عرض التغييرات
3. ✅ إضافة الملفات للـ staging
4. ✅ إنشاء commit
5. ✅ دفع التغييرات إلى GitHub

### الطريقة اليدوية

#### 1. فحص الحالة

```cmd
git status
```

#### 2. إضافة الملفات

```cmd
# إضافة جميع الملفات
git add .

# أو إضافة ملف محدد
git add path/to/file.js
```

#### 3. إنشاء Commit

```cmd
git commit -m "وصف التغييرات"
```

#### 4. دفع التغييرات

```cmd
git push origin main
```

## أدوات مساعدة

### 1. اختبار عملية الدفع

```cmd
test_git_push.bat
```

يقوم بـ:
- ✅ فحص إعدادات Git
- ✅ فحص الاتصال بـ GitHub
- ✅ اختبار الدفع (dry run)
- ✅ خيار الدفع الفعلي

### 2. إعداد Git

```cmd
setup_git.bat
```

لإعداد أو تغيير إعدادات Git.

### 3. Commit و Push

```cmd
git_commit_push.bat
```

عملية كاملة من البداية للنهاية.

## الأوامر الأساسية

### فحص الحالة

```cmd
# حالة مختصرة
git status

# حالة مفصلة
git status --long
```

### عرض التغييرات

```cmd
# التغييرات غير المضافة
git diff

# التغييرات المضافة
git diff --cached

# التغييرات في ملف محدد
git diff path/to/file.js
```

### عرض السجل

```cmd
# آخر 5 commits
git log --oneline -5

# سجل مفصل
git log --graph --all --decorate
```

### التراجع عن التغييرات

```cmd
# التراجع عن تغييرات ملف (قبل add)
git restore path/to/file.js

# إزالة ملف من staging (بعد add)
git restore --staged path/to/file.js

# التراجع عن آخر commit (يحتفظ بالتغييرات)
git reset --soft HEAD~1

# التراجع عن آخر commit (يحذف التغييرات)
git reset --hard HEAD~1
```

## الفروع (Branches)

### عرض الفروع

```cmd
# الفروع المحلية
git branch

# جميع الفروع
git branch -a
```

### إنشاء فرع جديد

```cmd
# إنشاء والانتقال للفرع
git checkout -b feature/new-feature

# أو باستخدام switch
git switch -c feature/new-feature
```

### الانتقال بين الفروع

```cmd
git checkout main
# أو
git switch main
```

### دمج الفروع

```cmd
# الانتقال للفرع الرئيسي
git checkout main

# دمج الفرع
git merge feature/new-feature
```

## المشاكل الشائعة وحلولها

### 1. "Please tell me who you are"

**المشكلة**: لم يتم تعيين user.name أو user.email

**الحل**:
```cmd
setup_git.bat
```

أو يدويًا:
```cmd
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. "Authentication failed"

**المشكلة**: فشل المصادقة مع GitHub

**الحلول**:

#### أ. استخدام Personal Access Token

1. اذهب إلى: https://github.com/settings/tokens
2. أنشئ token جديد
3. استخدمه كـ password عند الدفع

#### ب. استخدام SSH

```cmd
# إنشاء SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# نسخ المفتاح العام
type %USERPROFILE%\.ssh\id_ed25519.pub

# أضفه في GitHub: Settings > SSH and GPG keys
```

ثم غيّر remote URL:
```cmd
git remote set-url origin git@github.com:careerak-hr/careerak-vsc.git
```

### 3. "Your branch is behind"

**المشكلة**: الفرع المحلي متأخر عن الفرع البعيد

**الحل**:
```cmd
git pull origin main
```

### 4. "Merge conflict"

**المشكلة**: تعارض في الدمج

**الحل**:
1. افتح الملفات المتعارضة
2. ابحث عن علامات `<<<<<<<`, `=======`, `>>>>>>>`
3. احذف العلامات واختر التغييرات المطلوبة
4. أضف الملفات: `git add .`
5. أكمل الدمج: `git commit`

### 5. "Push rejected"

**المشكلة**: رفض الدفع

**الأسباب المحتملة**:
- الفرع محمي (branch protection)
- لا توجد صلاحيات
- الفرع المحلي متأخر

**الحل**:
```cmd
# جلب التحديثات
git fetch origin

# دمج التحديثات
git pull origin main

# إعادة المحاولة
git push origin main
```

## نصائح مهمة

### 1. Commit Messages الجيدة

```cmd
# ❌ سيء
git commit -m "fix"

# ✅ جيد
git commit -m "Fix: Resolve build configuration issue in Gradle"

# ✅ ممتاز
git commit -m "Fix: Resolve Gradle build timeout

- Increased JVM memory to 2GB
- Enabled parallel builds
- Added caching configuration"
```

### 2. Commit بشكل متكرر

- اعمل commits صغيرة ومتكررة
- كل commit يجب أن يمثل تغيير منطقي واحد
- لا تجمع تغييرات غير مرتبطة في commit واحد

### 3. Pull قبل Push

```cmd
# دائمًا اجلب التحديثات قبل الدفع
git pull origin main
git push origin main
```

### 4. فحص التغييرات قبل Commit

```cmd
# راجع التغييرات
git diff

# راجع الملفات المضافة
git status
```

### 5. استخدام .gitignore

تأكد من عدم إضافة:
- ملفات node_modules/
- ملفات build/
- ملفات .env (تحتوي على أسرار)
- ملفات IDE الشخصية

## سير العمل الموصى به

### للتطوير اليومي

```cmd
# 1. ابدأ اليوم بجلب التحديثات
git pull origin main

# 2. اعمل على التغييرات
# ... تعديل الملفات ...

# 3. فحص التغييرات
git status
git diff

# 4. Commit و Push
git_commit_push.bat
```

### للميزات الكبيرة

```cmd
# 1. أنشئ فرع جديد
git checkout -b feature/new-feature

# 2. اعمل على الميزة
# ... تعديلات ...

# 3. Commit التغييرات
git add .
git commit -m "Add new feature"

# 4. ادفع الفرع
git push origin feature/new-feature

# 5. أنشئ Pull Request في GitHub

# 6. بعد الموافقة، ادمج في main
git checkout main
git merge feature/new-feature
git push origin main
```

## الأوامر المفيدة

### عرض معلومات Remote

```cmd
git remote -v
git remote show origin
```

### عرض الفروق بين Commits

```cmd
git diff HEAD~1 HEAD
```

### البحث في السجل

```cmd
# البحث عن commit يحتوي على كلمة
git log --grep="build"

# البحث عن تغييرات في ملف
git log -- path/to/file.js
```

### تنظيف الملفات غير المتتبعة

```cmd
# عرض الملفات التي ستحذف
git clean -n

# حذف الملفات
git clean -f

# حذف الملفات والمجلدات
git clean -fd
```

## الموارد الإضافية

### التوثيق الرسمي
- https://git-scm.com/doc
- https://docs.github.com/

### دروس تعليمية
- https://learngitbranching.js.org/
- https://www.atlassian.com/git/tutorials

### أدوات مساعدة
- GitHub Desktop: https://desktop.github.com/
- GitKraken: https://www.gitkraken.com/
- SourceTree: https://www.sourcetreeapp.com/

## الخلاصة

استخدم الأدوات المتوفرة:
- ✅ `setup_git.bat` - للإعداد الأولي
- ✅ `test_git_push.bat` - لاختبار الدفع
- ✅ `git_commit_push.bat` - للعمل اليومي

أو استخدم الأوامر اليدوية حسب الحاجة.

---

**آخر تحديث**: 2026-02-11  
**المهندس**: Eng.AlaaUddien
