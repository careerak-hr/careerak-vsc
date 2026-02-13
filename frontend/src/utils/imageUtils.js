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
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const SIZE = 1024; // حجم أكبر لجودة أفضل
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

        // تحويل إلى base64 بجودة عالية
        const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
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

/**
 * تحليل الصورة للتحقق من مطابقتها للمعايير
 * @param {string} imageSrc - مصدر الصورة
 * @param {string} userType - نوع المستخدم ('individual' أو 'company')
 * @returns {Promise<object>} - نتيجة التحليل {isValid, reason, confidence}
 */
export const analyzeImage = async (imageSrc, userType) => {
  return new Promise((resolve) => {
    const image = new Image();
    
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // تحليل خصائص الصورة
        const analysis = {
          brightness: 0,
          contrast: 0,
          colorfulness: 0,
          edgeCount: 0,
          faceIndicators: 0,
          logoIndicators: 0
        };
        
        let totalBrightness = 0;
        let minBrightness = 255;
        let maxBrightness = 0;
        
        // حساب السطوع والتباين
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // السطوع (Luminance)
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += brightness;
          minBrightness = Math.min(minBrightness, brightness);
          maxBrightness = Math.max(maxBrightness, brightness);
          
          // التنوع اللوني
          const colorDiff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
          analysis.colorfulness += colorDiff;
        }
        
        const pixelCount = data.length / 4;
        analysis.brightness = totalBrightness / pixelCount;
        analysis.contrast = maxBrightness - minBrightness;
        analysis.colorfulness = analysis.colorfulness / pixelCount;
        
        // كشف الحواف (Edge Detection) - مؤشر على التفاصيل
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            const idxRight = (y * canvas.width + (x + 1)) * 4;
            const idxDown = ((y + 1) * canvas.width + x) * 4;
            
            const diffX = Math.abs(data[idx] - data[idxRight]);
            const diffY = Math.abs(data[idx] - data[idxDown]);
            
            if (diffX + diffY > 50) {
              analysis.edgeCount++;
            }
          }
        }
        
        // مؤشرات الوجه البشري
        // الوجه البشري عادة يحتوي على:
        // - تنوع لوني متوسط (بشرة)
        // - سطوع متوسط
        // - تباين متوسط
        // - حواف كثيرة (عيون، أنف، فم)
        if (analysis.brightness > 80 && analysis.brightness < 200) {
          analysis.faceIndicators += 2;
        }
        if (analysis.contrast > 50 && analysis.contrast < 150) {
          analysis.faceIndicators += 2;
        }
        if (analysis.colorfulness > 10 && analysis.colorfulness < 40) {
          analysis.faceIndicators += 2;
        }
        if (analysis.edgeCount > pixelCount * 0.1) {
          analysis.faceIndicators += 2;
        }
        
        // مؤشرات اللوجو
        // اللوجو عادة يحتوي على:
        // - ألوان محددة (تنوع لوني منخفض أو عالي جداً)
        // - تباين عالي
        // - حواف حادة ومحددة
        // - مناطق صلبة من الألوان
        if (analysis.colorfulness < 10 || analysis.colorfulness > 50) {
          analysis.logoIndicators += 2;
        }
        if (analysis.contrast > 150) {
          analysis.logoIndicators += 2;
        }
        if (analysis.edgeCount < pixelCount * 0.05 || analysis.edgeCount > pixelCount * 0.3) {
          analysis.logoIndicators += 2;
        }
        
        // اتخاذ القرار بناءً على نوع المستخدم
        let isValid = false;
        let reason = '';
        let confidence = 0;
        
        if (userType === 'individual') {
          // للأفراد: نتوقع صورة وجه شخصي
          if (analysis.faceIndicators >= analysis.logoIndicators) {
            isValid = true;
            confidence = (analysis.faceIndicators / 8) * 100;
            reason = 'الصورة تبدو كصورة شخصية مناسبة';
          } else {
            isValid = false;
            confidence = (analysis.logoIndicators / 8) * 100;
            reason = 'الصورة تبدو كلوجو أو شعار وليست صورة شخصية';
          }
        } else if (userType === 'company') {
          // للشركات: نتوقع لوجو
          if (analysis.logoIndicators >= analysis.faceIndicators) {
            isValid = true;
            confidence = (analysis.logoIndicators / 8) * 100;
            reason = 'الصورة تبدو كلوجو مناسب للشركة';
          } else {
            isValid = false;
            confidence = (analysis.faceIndicators / 8) * 100;
            reason = 'الصورة تبدو كصورة شخصية وليست لوجو شركة';
          }
        }
        
        // التحقق من جودة الصورة
        if (analysis.brightness < 30) {
          isValid = false;
          reason = 'الصورة مظلمة جداً';
          confidence = 20;
        } else if (analysis.brightness > 230) {
          isValid = false;
          reason = 'الصورة ساطعة جداً';
          confidence = 20;
        } else if (analysis.contrast < 20) {
          isValid = false;
          reason = 'الصورة غير واضحة (تباين منخفض)';
          confidence = 30;
        }
        
        console.log('🤖 Image Analysis:', {
          userType,
          analysis,
          result: { isValid, reason, confidence: Math.round(confidence) }
        });
        
        resolve({
          isValid,
          reason,
          confidence: Math.round(confidence),
          details: analysis
        });
        
      } catch (error) {
        console.error('❌ Analysis error:', error);
        // في حالة الخطأ، نقبل الصورة بثقة منخفضة
        resolve({
          isValid: true,
          reason: 'تم قبول الصورة (فشل التحليل)',
          confidence: 50,
          details: null
        });
      }
    };
    
    image.onerror = () => {
      resolve({
        isValid: false,
        reason: 'فشل تحميل الصورة',
        confidence: 0,
        details: null
      });
    };
    
    image.src = imageSrc;
  });
};
