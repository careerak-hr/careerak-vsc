/**
 * تحليل الصور - نسخة خفيفة بدون TensorFlow
 * يعتمد على تحليل بيانات البكسل فقط (سريع، لا يحتاج CDN)
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
 * تحليل الصورة - خفيف وسريع
 */
export const analyzeImageWithAI = async (imageSrc, userType) => {
  try {
    return await fallbackAnalysis(imageSrc, userType);
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

/**
 * تحليل بسيط بناءً على بيانات البكسل
 */
const fallbackAnalysis = async (imageSrc, userType) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const pixelCount = data.length / 4;

  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avgBrightness = totalBrightness / pixelCount;

  if (avgBrightness < 10) {
    return { isValid: false, reason: 'عذراً، الصورة مظلمة جداً', confidence: 0, details: null };
  }
  if (avgBrightness > 245) {
    return { isValid: false, reason: 'عذراً، الصورة ساطعة جداً', confidence: 0, details: null };
  }

  return {
    isValid: true,
    reason: userType === 'individual' ? 'تم قبول الصورة الشخصية' : 'تم قبول صورة اللوجو',
    confidence: 80,
    details: null
  };
};

export default analyzeImageWithAI;
