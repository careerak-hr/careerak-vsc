/**
 * قص الصورة وإرجاع صورة مقصوصة بحجم محدد
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
    image.crossOrigin = 'anonymous'; // للسماح بالوصول للصور من مصادر مختلفة
    
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const SIZE = 512; // حجم أكبر لجودة أفضل
        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // رسم الصورة المقصوصة
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          SIZE,
          SIZE
        );

        // تحويل إلى base64
        const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(croppedImage);
        
      } catch (error) {
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
