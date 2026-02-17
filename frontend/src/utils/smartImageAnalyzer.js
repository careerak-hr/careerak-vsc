/**
 * نظام التحليل الذكي للصور باستخدام TensorFlow.js
 * يستخدم نموذج MobileNet للتعرف على محتوى الصورة
 */

let mobilenet = null;
let isModelLoading = false;

/**
 * تحميل نموذج MobileNet
 */
const loadMobileNet = async () => {
  if (mobilenet) return mobilenet;
  if (isModelLoading) {
    // انتظر حتى ينتهي التحميل
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return mobilenet;
  }

  try {
    isModelLoading = true;
    console.log('🤖 Loading MobileNet model...');
    
    // تحميل TensorFlow.js و MobileNet
    if (!window.tf) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js');
    }
    
    if (!window.mobilenet) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');
    }
    
    mobilenet = await window.mobilenet.load({
      version: 2,
      alpha: 1.0
    });
    
    console.log('✅ MobileNet model loaded successfully');
    isModelLoading = false;
    return mobilenet;
  } catch (error) {
    console.error('❌ Failed to load MobileNet:', error);
    isModelLoading = false;
    return null;
  }
};

/**
 * تحميل سكريبت خارجي
 */
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
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
 * تحليل الصورة باستخدام MobileNet
 */
export const analyzeImageWithAI = async (imageSrc, userType) => {
  try {
    console.log('🤖 Starting AI image analysis for:', userType);
    
    // تحميل النموذج
    const model = await loadMobileNet();
    if (!model) {
      console.warn('⚠️ Model not available, using fallback');
      return fallbackAnalysis(imageSrc, userType);
    }
    
    // تحميل الصورة
    const image = await loadImage(imageSrc);
    
    // التعرف على محتوى الصورة
    console.log('🔍 Classifying image...');
    const predictions = await model.classify(image);
    
    console.log('📊 Predictions:', predictions);
    
    // تحليل النتائج
    if (userType === 'individual') {
      return analyzeForPerson(predictions, imageSrc);
    } else {
      return analyzeForCompany(predictions, imageSrc);
    }
    
  } catch (error) {
    console.error('❌ AI analysis error:', error);
    return fallbackAnalysis(imageSrc, userType);
  }
};

/**
 * تحليل للأفراد (صورة شخصية)
 */
const analyzeForPerson = async (predictions, imageSrc) => {
  // كلمات مفتاحية للصور الشخصية
  const personKeywords = [
    'person', 'face', 'man', 'woman', 'boy', 'girl', 'human',
    'portrait', 'head', 'people', 'selfie', 'profile'
  ];
  
  // كلمات مفتاحية للأشياء غير المقبولة
  const invalidKeywords = [
    'aquarium', 'fish', 'tank', 'water', 'animal', 'pet', 'dog', 'cat',
    'car', 'vehicle', 'building', 'house', 'food', 'plant', 'flower',
    'furniture', 'object', 'tool', 'device', 'screen', 'monitor',
    'landscape', 'nature', 'sky', 'tree', 'mountain', 'ocean'
  ];
  
  // البحث عن تطابقات
  let hasPersonMatch = false;
  let hasInvalidMatch = false;
  let maxPersonConfidence = 0;
  let maxInvalidConfidence = 0;
  let matchedLabel = '';
  
  for (const pred of predictions) {
    const label = pred.className.toLowerCase();
    const confidence = pred.probability;
    
    // تحقق من الكلمات المفتاحية للأشخاص
    for (const keyword of personKeywords) {
      if (label.includes(keyword)) {
        hasPersonMatch = true;
        if (confidence > maxPersonConfidence) {
          maxPersonConfidence = confidence;
          matchedLabel = pred.className;
        }
      }
    }
    
    // تحقق من الكلمات المفتاحية غير المقبولة
    for (const keyword of invalidKeywords) {
      if (label.includes(keyword)) {
        hasInvalidMatch = true;
        if (confidence > maxInvalidConfidence) {
          maxInvalidConfidence = confidence;
          matchedLabel = pred.className;
        }
      }
    }
  }
  
  console.log('👤 Person match:', hasPersonMatch, 'confidence:', maxPersonConfidence);
  console.log('❌ Invalid match:', hasInvalidMatch, 'confidence:', maxInvalidConfidence);
  
  // القرار النهائي
  if (hasInvalidMatch && maxInvalidConfidence > 0.3) {
    return {
      isValid: false,
      reason: `عذراً، هذه الصورة تبدو أنها ${getArabicLabel(matchedLabel)} وليست صورة شخصية. يرجى رفع صورة لوجهك.`,
      confidence: Math.round(maxInvalidConfidence * 100),
      details: { predictions, matchedLabel }
    };
  }
  
  if (hasPersonMatch && maxPersonConfidence > 0.2) {
    return {
      isValid: true,
      reason: 'تم التعرف على صورة شخصية مناسبة',
      confidence: Math.round(maxPersonConfidence * 100),
      details: { predictions, matchedLabel }
    };
  }
  
  // إذا لم يتم التعرف على شيء واضح، استخدم التحليل الاحتياطي
  return fallbackAnalysis(imageSrc, 'individual');
};

/**
 * تحليل للشركات (لوجو)
 */
const analyzeForCompany = async (predictions, imageSrc) => {
  // كلمات مفتاحية للوجو
  const logoKeywords = [
    'logo', 'brand', 'emblem', 'symbol', 'sign', 'badge',
    'text', 'letter', 'word', 'label', 'design', 'graphic'
  ];
  
  // كلمات مفتاحية للأشياء غير المقبولة
  const invalidKeywords = [
    'person', 'face', 'man', 'woman', 'human', 'selfie',
    'aquarium', 'fish', 'tank', 'animal', 'pet',
    'landscape', 'nature', 'food'
  ];
  
  let hasLogoMatch = false;
  let hasInvalidMatch = false;
  let maxLogoConfidence = 0;
  let maxInvalidConfidence = 0;
  let matchedLabel = '';
  
  for (const pred of predictions) {
    const label = pred.className.toLowerCase();
    const confidence = pred.probability;
    
    // تحقق من الكلمات المفتاحية للوجو
    for (const keyword of logoKeywords) {
      if (label.includes(keyword)) {
        hasLogoMatch = true;
        if (confidence > maxLogoConfidence) {
          maxLogoConfidence = confidence;
          matchedLabel = pred.className;
        }
      }
    }
    
    // تحقق من الكلمات المفتاحية غير المقبولة
    for (const keyword of invalidKeywords) {
      if (label.includes(keyword)) {
        hasInvalidMatch = true;
        if (confidence > maxInvalidConfidence) {
          maxInvalidConfidence = confidence;
          matchedLabel = pred.className;
        }
      }
    }
  }
  
  console.log('🏢 Logo match:', hasLogoMatch, 'confidence:', maxLogoConfidence);
  console.log('❌ Invalid match:', hasInvalidMatch, 'confidence:', maxInvalidConfidence);
  
  // القرار النهائي
  if (hasInvalidMatch && maxInvalidConfidence > 0.3) {
    return {
      isValid: false,
      reason: `عذراً، هذه الصورة تبدو أنها ${getArabicLabel(matchedLabel)} وليست لوجو شركة. يرجى رفع صورة لوجو شركتك.`,
      confidence: Math.round(maxInvalidConfidence * 100),
      details: { predictions, matchedLabel }
    };
  }
  
  // للوجو، نكون أكثر تساهلاً
  if (!hasInvalidMatch || maxInvalidConfidence < 0.2) {
    return {
      isValid: true,
      reason: 'تم قبول صورة اللوجو',
      confidence: 70,
      details: { predictions }
    };
  }
  
  return fallbackAnalysis(imageSrc, 'company');
};

/**
 * ترجمة التصنيفات للعربية
 */
const getArabicLabel = (label) => {
  const translations = {
    'aquarium': 'حوض سمك',
    'fish': 'سمكة',
    'tank': 'خزان',
    'water': 'ماء',
    'animal': 'حيوان',
    'dog': 'كلب',
    'cat': 'قطة',
    'car': 'سيارة',
    'vehicle': 'مركبة',
    'building': 'مبنى',
    'house': 'منزل',
    'food': 'طعام',
    'plant': 'نبات',
    'flower': 'زهرة',
    'landscape': 'منظر طبيعي',
    'nature': 'طبيعة'
  };
  
  const lowerLabel = label.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (lowerLabel.includes(key)) {
      return value;
    }
  }
  
  return 'شيء آخر';
};

/**
 * تحليل احتياطي بسيط (في حالة فشل AI)
 */
const fallbackAnalysis = async (imageSrc, userType) => {
  console.log('⚠️ Using fallback analysis');
  
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
  
  // قبول الصورة إذا كانت ليست سوداء أو بيضاء تماماً
  if (avgBrightness < 10) {
    return {
      isValid: false,
      reason: 'عذراً، الصورة مظلمة جداً',
      confidence: 0,
      details: { brightness: avgBrightness }
    };
  }
  
  if (avgBrightness > 245) {
    return {
      isValid: false,
      reason: 'عذراً، الصورة ساطعة جداً',
      confidence: 0,
      details: { brightness: avgBrightness }
    };
  }
  
  // قبول الصورة مع تحذير
  return {
    isValid: true,
    reason: userType === 'individual' 
      ? 'تم قبول الصورة (تأكد أنها صورة شخصية واضحة)' 
      : 'تم قبول الصورة (تأكد أنها لوجو شركتك)',
    confidence: 60,
    details: { brightness: avgBrightness, fallback: true }
  };
};

export default analyzeImageWithAI;
