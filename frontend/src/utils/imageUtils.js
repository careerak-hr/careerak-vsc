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
 * كشف الوجوه في الصورة باستخدام Face Detection API
 * @param {string} imageSrc - مصدر الصورة
 * @returns {Promise<object>} - نتيجة كشف الوجوه
 */
const detectFaces = async (imageSrc) => {
  try {
    // التحقق من دعم المتصفح لـ Face Detection API
    if (!('FaceDetector' in window)) {
      console.warn('⚠️ Face Detection API not supported, using fallback');
      return null;
    }

    const image = await loadImage(imageSrc);
    const faceDetector = new window.FaceDetector({ maxDetectedFaces: 5, fastMode: false });
    const faces = await faceDetector.detect(image);
    
    console.log('👤 Faces detected:', faces.length);
    return {
      count: faces.length,
      faces: faces.map(face => ({
        confidence: face.confidence || 0,
        boundingBox: face.boundingBox
      }))
    };
  } catch (error) {
    console.warn('⚠️ Face detection failed:', error.message);
    return null;
  }
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
 * تحليل متقدم للصورة - كشف الوجوه والخصائص
 */
const advancedImageAnalysis = async (imageSrc) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const pixelCount = data.length / 4;
  
  // تحليل متقدم للخصائص
  let totalBrightness = 0;
  let minBrightness = 255;
  let maxBrightness = 0;
  let totalSaturation = 0;
  let skinTonePixels = 0;
  let edgeCount = 0;
  let colorVariance = 0;
  
  // مصفوفة لحساب توزيع الألوان
  const colorBuckets = new Array(8).fill(0);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // السطوع
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
    minBrightness = Math.min(minBrightness, brightness);
    maxBrightness = Math.max(maxBrightness, brightness);
    
    // التشبع (Saturation)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    totalSaturation += saturation;
    
    // كشف ألوان البشرة (Skin tone detection)
    if (r > 95 && g > 40 && b > 20 && 
        r > g && r > b && 
        Math.abs(r - g) > 15 &&
        max - min > 15) {
      skinTonePixels++;
    }
    
    // توزيع الألوان
    const bucket = Math.floor((r + g + b) / 96);
    colorBuckets[Math.min(bucket, 7)]++;
    
    // تباين الألوان
    colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
  }
  
  // كشف الحواف المتقدم (Sobel operator)
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      
      // Sobel X
      const gx = 
        -data[((y-1) * canvas.width + (x-1)) * 4] + data[((y-1) * canvas.width + (x+1)) * 4] +
        -2 * data[(y * canvas.width + (x-1)) * 4] + 2 * data[(y * canvas.width + (x+1)) * 4] +
        -data[((y+1) * canvas.width + (x-1)) * 4] + data[((y+1) * canvas.width + (x+1)) * 4];
      
      // Sobel Y
      const gy = 
        -data[((y-1) * canvas.width + (x-1)) * 4] - 2 * data[((y-1) * canvas.width + x) * 4] - data[((y-1) * canvas.width + (x+1)) * 4] +
        data[((y+1) * canvas.width + (x-1)) * 4] + 2 * data[((y+1) * canvas.width + x) * 4] + data[((y+1) * canvas.width + (x+1)) * 4];
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      if (magnitude > 100) edgeCount++;
    }
  }
  
  // حساب المتوسطات
  const avgBrightness = totalBrightness / pixelCount;
  const contrast = maxBrightness - minBrightness;
  const avgSaturation = totalSaturation / pixelCount;
  const skinToneRatio = skinTonePixels / pixelCount;
  const edgeRatio = edgeCount / pixelCount;
  const avgColorVariance = colorVariance / pixelCount;
  
  // حساب توزيع الألوان (Color distribution entropy)
  let colorEntropy = 0;
  for (const count of colorBuckets) {
    if (count > 0) {
      const p = count / pixelCount;
      colorEntropy -= p * Math.log2(p);
    }
  }
  
  return {
    brightness: avgBrightness,
    contrast,
    saturation: avgSaturation,
    skinToneRatio,
    edgeRatio,
    colorVariance: avgColorVariance,
    colorEntropy,
    width: canvas.width,
    height: canvas.height
  };
};

/**
 * تحليل بسيط وموثوق للصورة - بدون AI معقد
 * @param {string} imageSrc - مصدر الصورة
 * @param {string} userType - نوع المستخدم ('individual' أو 'company')
 * @returns {Promise<object>} - نتيجة التحليل {isValid, reason, confidence}
 */
export const analyzeImage = async (imageSrc, userType) => {
  try {
    console.log('🔍 Starting simple image validation for:', userType);
    
    // تحليل بسيط للصورة
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixelCount = data.length / 4;
    
    // حساب السطوع المتوسط
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
    }
    const avgBrightness = totalBrightness / pixelCount;
    
    console.log('📊 Image brightness:', avgBrightness);
    
    // ✅ قبول الصورة إذا كانت ليست سوداء تماماً
    if (avgBrightness < 10) {
      console.log('❌ Image is too dark (black)');
      return {
        isValid: false,
        reason: 'عذراً، حدث خطأ في معالجة الصورة. يرجى المحاولة مرة أخرى',
        confidence: 0,
        details: { brightness: avgBrightness }
      };
    }
    
    // ✅ قبول الصورة إذا كانت ليست بيضاء تماماً
    if (avgBrightness > 245) {
      console.log('❌ Image is too bright (white)');
      return {
        isValid: false,
        reason: 'عذراً، الصورة ساطعة جداً',
        confidence: 0,
        details: { brightness: avgBrightness }
      };
    }
    
    // ✅ قبول جميع الصور الأخرى
    console.log('✅ Image is valid');
    
    const successMessage = userType === 'individual' 
      ? 'تم قبول الصورة الشخصية' 
      : 'تم قبول صورة اللوجو';
    
    return {
      isValid: true,
      reason: successMessage,
      confidence: 100,
      details: { brightness: avgBrightness }
    };
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    return {
      isValid: false,
      reason: 'عذراً، حدث خطأ أثناء تحليل الصورة',
      confidence: 0,
      details: null
    };
  }
};
