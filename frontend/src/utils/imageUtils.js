/**
 * قص الصورة وإرجاع صورة مقصوصة بحجم محدد ومضغوطة
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
        console.log('✂️ Crop area:', pixelCrop);
        
        const canvas = document.createElement('canvas');
        // ✅ زيادة الحجم من 512 إلى 800 لجودة أفضل
        const SIZE = 800;
        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // ✅ تحسين جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ✅ رسم خلفية بيضاء أولاً لتجنب الشفافية
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, SIZE, SIZE);

        // ✅ التأكد من أن معاملات القص صحيحة وضمن حدود الصورة
        const cropX = Math.max(0, Math.min(pixelCrop.x, image.width));
        const cropY = Math.max(0, Math.min(pixelCrop.y, image.height));
        const cropWidth = Math.min(pixelCrop.width, image.width - cropX);
        const cropHeight = Math.min(pixelCrop.height, image.height - cropY);

        console.log('✅ Adjusted crop:', { cropX, cropY, cropWidth, cropHeight });

        // رسم الصورة المقصوصة
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          SIZE,
          SIZE
        );

        // ✅ تحويل إلى base64 بجودة عالية
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
 * تحليل الصورة للتحقق من مطابقتها للمعايير - نظام متقدم
 * @param {string} imageSrc - مصدر الصورة
 * @param {string} userType - نوع المستخدم ('individual' أو 'company')
 * @returns {Promise<object>} - نتيجة التحليل {isValid, reason, confidence}
 */
export const analyzeImage = async (imageSrc, userType) => {
  try {
    console.log('🤖 Starting advanced AI analysis for:', userType);
    
    // 1. كشف الوجوه باستخدام Face Detection API
    const faceDetection = await detectFaces(imageSrc);
    
    // 2. التحليل المتقدم للصورة
    const analysis = await advancedImageAnalysis(imageSrc);
    
    console.log('📊 Analysis results:', { faceDetection, analysis });
    
    // 3. اتخاذ القرار بناءً على نوع المستخدم
    let isValid = false;
    let reason = '';
    let confidence = 0;
    
    if (userType === 'individual') {
      // للأفراد: يجب أن تكون صورة وجه بشري حصراً
      
      // التحقق من وجود وجوه
      const hasFaces = faceDetection && faceDetection.count > 0;
      const faceScore = hasFaces ? Math.min(faceDetection.count * 30, 40) : 0;
      
      // مؤشرات الوجه البشري
      let faceIndicators = faceScore;
      
      // نسبة ألوان البشرة (مهم جداً)
      if (analysis.skinToneRatio > 0.15) faceIndicators += 25;
      else if (analysis.skinToneRatio > 0.08) faceIndicators += 15;
      else if (analysis.skinToneRatio > 0.03) faceIndicators += 5;
      
      // السطوع المناسب للوجه
      if (analysis.brightness > 80 && analysis.brightness < 200) faceIndicators += 10;
      
      // التباين المناسب
      if (analysis.contrast > 40 && analysis.contrast < 180) faceIndicators += 10;
      
      // التشبع المناسب
      if (analysis.saturation > 0.1 && analysis.saturation < 0.6) faceIndicators += 10;
      
      // الحواف (الوجه يحتوي على تفاصيل)
      if (analysis.edgeRatio > 0.05 && analysis.edgeRatio < 0.25) faceIndicators += 5;
      
      confidence = Math.min(faceIndicators, 100);
      
      // القرار النهائي
      if (confidence >= 60 && hasFaces) {
        isValid = true;
        reason = 'تم التعرف على صورة شخصية مناسبة';
      } else if (!hasFaces && analysis.skinToneRatio < 0.03) {
        isValid = false;
        reason = 'عذراً، الصورة المختارة ليست صورة شخصية';
      } else if (!hasFaces) {
        isValid = false;
        reason = 'عذراً، لم يتم التعرف على وجه بشري في الصورة';
      } else {
        isValid = false;
        reason = 'عذراً، جودة الصورة غير كافية أو الصورة غير واضحة';
      }
      
    } else if (userType === 'company') {
      // للشركات: يجب أن تكون صورة لوجو حصراً
      
      // التحقق من عدم وجود وجوه
      const noFaces = !faceDetection || faceDetection.count === 0;
      const noFaceScore = noFaces ? 30 : 0;
      
      // مؤشرات اللوجو
      let logoIndicators = noFaceScore;
      
      // عدم وجود ألوان بشرة
      if (analysis.skinToneRatio < 0.03) logoIndicators += 25;
      else if (analysis.skinToneRatio < 0.08) logoIndicators += 10;
      
      // تباين عالي (اللوجو عادة واضح)
      if (analysis.contrast > 120) logoIndicators += 15;
      else if (analysis.contrast > 80) logoIndicators += 10;
      
      // توزيع ألوان محدد (entropy منخفض = ألوان قليلة)
      if (analysis.colorEntropy < 2.5) logoIndicators += 15;
      else if (analysis.colorEntropy < 3.0) logoIndicators += 10;
      
      // حواف حادة ومحددة
      if (analysis.edgeRatio > 0.15 || analysis.edgeRatio < 0.08) logoIndicators += 10;
      
      // تشبع مناسب
      if (analysis.saturation > 0.3 || analysis.saturation < 0.15) logoIndicators += 5;
      
      confidence = Math.min(logoIndicators, 100);
      
      // القرار النهائي
      if (confidence >= 60 && noFaces) {
        isValid = true;
        reason = 'تم التعرف على لوجو مناسب للشركة';
      } else if (faceDetection && faceDetection.count > 0) {
        isValid = false;
        reason = 'عذراً، الصورة المختارة ليست لوجو شركة';
      } else if (analysis.skinToneRatio > 0.1) {
        isValid = false;
        reason = 'عذراً، الصورة تبدو كصورة شخصية وليست لوجو';
      } else {
        isValid = false;
        reason = 'عذراً، جودة الصورة غير كافية أو الصورة غير واضحة';
      }
    }
    
    // التحقق من جودة الصورة العامة
    // ✅ تخفيف شروط السطوع بشكل كبير
    if (analysis.brightness < 5) { // ✅ تغيير من 10 إلى 5 - أكثر تساهلاً
      isValid = false;
      reason = 'عذراً، الصورة مظلمة جداً';
      confidence = 10;
    } else if (analysis.brightness > 250) { // ✅ تغيير من 245 إلى 250
      isValid = false;
      reason = 'عذراً، الصورة ساطعة جداً';
      confidence = 10;
    } else if (analysis.contrast < 5) { // ✅ تغيير من 10 إلى 5 - أكثر تساهلاً
      isValid = false;
      reason = 'عذراً، الصورة غير واضحة';
      confidence = 15;
    }
    
    // ✅ إذا كانت الصورة سوداء تماماً (مشكلة في القص)
    if (analysis.brightness < 3 && analysis.contrast < 3) {
      isValid = false;
      reason = 'عذراً، حدث خطأ في معالجة الصورة. يرجى المحاولة مرة أخرى';
      confidence = 0;
    }
    
    console.log('✅ Final decision:', { isValid, reason, confidence });
    
    return {
      isValid,
      reason,
      confidence: Math.round(confidence),
      details: {
        faceDetection,
        analysis
      }
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
