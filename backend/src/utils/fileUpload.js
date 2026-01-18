const fs = require('fs');
const path = require('path');

// إنشاء مجلد الصور إذا لم يكن موجوداً
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadImage = (file, folder = 'profiles') => {
  try {
    // التحقق من نوع الملف
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('نوع الملف غير مدعوم');
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('حجم الملف يتجاوز الحد الأقصى (5MB)');
    }

    // إنشاء مجلد المشروع إذا لم يكن موجوداً
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // توليد اسم ملف فريد
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(folderPath, filename);

    // حفظ الملف
    fs.writeFileSync(filepath, file.buffer);

    // إرجاع رابط الصورة
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    throw new Error(`فشل رفع الصورة: ${error.message}`);
  }
};

const deleteImage = (imagePath) => {
  try {
    if (!imagePath) return;
    
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('فشل حذف الصورة:', error);
  }
};

module.exports = { uploadImage, deleteImage };
