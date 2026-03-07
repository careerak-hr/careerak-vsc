/**
 * دوال مساعدة لمشاركة الوظائف
 * تدعم Web Share API مع fallback للمنصات المختلفة
 */

/**
 * تتبع المشاركة (إرسال إلى Backend)
 * @param {string} jobId - معرف الوظيفة
 * @param {string} platform - المنصة (copy, whatsapp, linkedin, twitter, facebook, native)
 */
export const trackShare = async (jobId, platform) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return; // لا نتبع المشاركات للمستخدمين غير المسجلين

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    await fetch(`${apiUrl}/api/jobs/${jobId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ platform })
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    // لا نعرض خطأ للمستخدم - التتبع اختياري
  }
};

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @returns {Promise<boolean>} - نجح أم لا
 */
export const copyToClipboard = async (text) => {
  try {
    // محاولة استخدام Clipboard API الحديث
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback للمتصفحات القديمة
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * الحصول على رابط الوظيفة
 * @param {string} jobId - معرف الوظيفة
 * @returns {string} - الرابط الكامل
 */
export const getJobUrl = (jobId) => {
  return `${window.location.origin}/jobs/${jobId}`;
};

/**
 * إنشاء بيانات المشاركة
 * @param {Object} job - بيانات الوظيفة
 * @returns {Object} - بيانات المشاركة
 */
export const createShareData = (job) => {
  const url = getJobUrl(job.id);
  const title = job.title;
  const companyName = job.company?.name || 'شركة';
  const location = job.location?.city || '';
  
  return {
    title: `${title} - ${companyName}`,
    text: `${title} في ${companyName}${location ? ` - ${location}` : ''}`,
    url
  };
};

/**
 * مشاركة عبر Web Share API (للموبايل)
 * @param {Object} job - بيانات الوظيفة
 * @returns {Promise<boolean>} - نجح أم لا
 */
export const shareNative = async (job) => {
  if (!navigator.share) {
    return false;
  }

  try {
    const shareData = createShareData(job);
    await navigator.share(shareData);
    await trackShare(job.id, 'native');
    return true;
  } catch (error) {
    // المستخدم ألغى المشاركة أو حدث خطأ
    if (error.name !== 'AbortError') {
      console.error('Error sharing:', error);
    }
    return false;
  }
};

/**
 * مشاركة عبر WhatsApp
 * @param {Object} job - بيانات الوظيفة
 */
export const shareWhatsApp = (job) => {
  const shareData = createShareData(job);
  const text = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
  const url = `https://wa.me/?text=${text}`;
  
  window.open(url, '_blank', 'width=600,height=400');
  trackShare(job.id, 'whatsapp');
};

/**
 * مشاركة عبر LinkedIn
 * @param {Object} job - بيانات الوظيفة
 */
export const shareLinkedIn = (job) => {
  const shareData = createShareData(job);
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
  
  window.open(url, '_blank', 'width=600,height=400');
  trackShare(job.id, 'linkedin');
};

/**
 * مشاركة عبر Twitter
 * @param {Object} job - بيانات الوظيفة
 */
export const shareTwitter = (job) => {
  const shareData = createShareData(job);
  const text = encodeURIComponent(shareData.text);
  const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareData.url)}`;
  
  window.open(url, '_blank', 'width=600,height=400');
  trackShare(job.id, 'twitter');
};

/**
 * مشاركة عبر Facebook
 * @param {Object} job - بيانات الوظيفة
 */
export const shareFacebook = (job) => {
  const shareData = createShareData(job);
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
  
  window.open(url, '_blank', 'width=600,height=400');
  trackShare(job.id, 'facebook');
};

/**
 * نسخ رابط الوظيفة
 * @param {Object} job - بيانات الوظيفة
 * @returns {Promise<boolean>} - نجح أم لا
 */
export const shareCopy = async (job) => {
  const url = getJobUrl(job.id);
  const success = await copyToClipboard(url);
  
  if (success) {
    await trackShare(job.id, 'copy');
  }
  
  return success;
};

/**
 * مشاركة الوظيفة حسب المنصة
 * @param {Object} job - بيانات الوظيفة
 * @param {string} platform - المنصة (native, copy, whatsapp, linkedin, twitter, facebook)
 * @returns {Promise<boolean>} - نجح أم لا
 */
export const shareJob = async (job, platform) => {
  switch (platform) {
    case 'native':
      return await shareNative(job);
    
    case 'copy':
      return await shareCopy(job);
    
    case 'whatsapp':
      shareWhatsApp(job);
      return true;
    
    case 'linkedin':
      shareLinkedIn(job);
      return true;
    
    case 'twitter':
      shareTwitter(job);
      return true;
    
    case 'facebook':
      shareFacebook(job);
      return true;
    
    default:
      console.error('Unknown share platform:', platform);
      return false;
  }
};

/**
 * التحقق من دعم Web Share API
 * @returns {boolean}
 */
export const isNativeShareSupported = () => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};
