/**
 * قص الصورة وإرجاع صورة مقصوصة بحجم محدد ومضغوطة
 * متوافقة مع react-easy-crop
 * @param {string} imageSrc - مصدر الصورة (base64 أو URL)
 * @param {object} pixelCrop - معلومات القص {x, y, width, height}
 * @returns {Promise<string>} - الصورة المقصوصة بصيغة base64
 */
export const createCroppedImage = async (imageSrc, pixelCrop) => {
  if (!imageSrc) {
    throw new Error('Image source is required');
  }
  
  if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
    throw new Error('Invalid crop dimensions');
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      try {
        console.log('🖼️ Original image size:', image.width, 'x', image.height);
        console.log('✂️ Crop area from react-easy-crop:', pixelCrop);
        
        const canvas = document.createElement('canvas');
        const SIZE = 800; // حجم الصورة النهائية
        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // تحسين جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // رسم خلفية بيضاء أولاً لتجنب الشفافية
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, SIZE, SIZE);

        // ✅ react-easy-crop تعطي معاملات دقيقة جداً
        // لا حاجة لتعديلها - فقط نستخدمها مباشرة
        const { x, y, width, height } = pixelCrop;
        
        console.log('✅ Using crop coordinates:', { x, y, width, height });

        // رسم الصورة المقصوصة
        ctx.drawImage(
          image,
          x,      // مصدر X
          y,      // مصدر Y
          width,  // عرض المصدر
          height, // ارتفاع المصدر
          0,      // وجهة X
          0,      // وجهة Y
          SIZE,   // عرض الوجهة
          SIZE    // ارتفاع الوجهة
        );

        // تحويل إلى base64 بجودة عالية
        const croppedImage = canvas.toDataURL('image/jpeg', 0.92);
        
        console.log('✅ Cropped image created successfully');
        resolve(croppedImage);
        
      } catch (error) {
        console.error('❌ Crop error:', error);
        reject(new Error(`Failed to crop image: ${error.message}`));
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    image.src = imageSrc;
  });
};

/**
 * ضغط الصورة لتقليل الحجم
 * @param {string} imageSrc - مصدر الصورة
 * @param {number} maxWidth - العرض الأقصى
 * @param {number} maxHeight - الارتفاع الأقصى
 * @param {number} quality - جودة الصورة (0-1)
 * @returns {Promise<string>} - الصورة المضغوطة
 */
export const compressImage = async (imageSrc, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    image.onload = () => {
      try {
        let width = image.width;
        let height = image.height;

        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        reject(new Error(`Failed to compress image: ${error.message}`));
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    image.src = imageSrc;
  });
};

/**
 * تحميل الصورة كعنصر Image
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * تحليل بسيط وموثوق للصورة - بدون AI معقد
 * @param {string} imageSrc - مصدر الصورة
 * @param {string} userType - نوع المستخدم ('individual' أو 'company')
 * @returns {Promise<object>} - نتيجة التحليل {isValid, reason, confidence}
 */
export const analyzeImage = async (imageSrc, userType) => {
  try {
    const { analyzeImageWithAI } = await import('./smartImageAnalyzer.js');

    // timeout 3 ثواني - إذا تجاوز نقبل الصورة مباشرة
    const result = await Promise.race([
      analyzeImageWithAI(imageSrc, userType),
      new Promise((resolve) =>
        setTimeout(() => resolve({
          isValid: true,
          reason: userType === 'individual' ? 'تم قبول الصورة الشخصية' : 'تم قبول صورة اللوجو',
          confidence: 70,
          details: null
        }), 3000)
      )
    ]);

    return result;
  } catch (error) {
    console.error('❌ Analysis error:', error);
    return {
      isValid: true,
      reason: userType === 'individual' ? 'تم قبول الصورة الشخصية' : 'تم قبول صورة اللوجو',
      confidence: 70,
      details: null
    };
  }
};
