/**
 * دوال مساعدة لمشاركة المحتوى
 * تدعم Web Share API مع fallback للمنصات المختلفة
 * تدعم: وظائف، دورات، ملفات شخصية، شركات
 */

const BASE_URL = 'https://careerak.com';

/**
 * تتبع المشاركة (إرسال إلى Backend)
 * @param {string} contentId - معرف المحتوى
 * @param {string} platform - المنصة (shareMethod)
 * @param {string} contentType - نوع المحتوى ('job' | 'course' | 'profile' | 'company')
 */
export const trackShare = async (contentId, platform, contentType = 'job') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Map legacy 'copy' platform name to the backend-expected 'copy_link'
    const shareMethod = platform === 'copy' ? 'copy_link' : platform;

    await fetch(`${apiUrl}/api/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ contentType, contentId, shareMethod }),
    });
  } catch (error) {
    console.error('Error tracking share:', error);
  }
};

/**
 * نسخ النص إلى الحافظة مع fallback
 * @returns {{ success: boolean, fallback: boolean }}
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, fallback: false };
    }

    // Fallback: execCommand
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
    return { success: successful, fallback: false };
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return { success: false, fallback: true };
  }
};

/**
 * الحصول على رابط المحتوى بناءً على نوعه
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {string} contentId - معرف المحتوى
 * @returns {string} - الرابط الكامل
 */
export const getContentUrl = (contentType, contentId) => {
  const paths = {
    job: `job-postings/${contentId}`,
    course: `courses/${contentId}`,
    profile: `profile/${contentId}`,
    company: `companies/${contentId}`,
  };
  const path = paths[contentType] || `job-postings/${contentId}`;
  return `${BASE_URL}/${path}`;
};

/**
 * إضافة UTM parameters إلى الرابط
 * @param {string} url - الرابط الأصلي
 * @param {string} source - utm_source
 * @param {string} medium - utm_medium
 * @returns {string}
 */
export const addUtmParams = (url, source, medium = 'social') => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=${source}&utm_medium=${medium}`;
};

/**
 * استخراج عنوان المحتوى
 */
export const getContentTitle = (content, contentType) => {
  if (!content) return '';
  switch (contentType) {
    case 'job':
      return content.title || content.jobTitle || '';
    case 'course':
      return content.title || content.courseName || '';
    case 'profile':
      return content.name || `${content.firstName || ''} ${content.lastName || ''}`.trim() || '';
    case 'company':
      return content.name || content.companyName || '';
    default:
      return content.title || content.name || '';
  }
};

/**
 * استخراج العنوان الفرعي للمحتوى
 */
export const getContentSubtitle = (content, contentType) => {
  if (!content) return '';
  switch (contentType) {
    case 'job':
      return content.company?.name || content.companyName || '';
    case 'course':
      return content.instructor || content.provider || '';
    case 'profile':
      return content.jobTitle || content.headline || '';
    case 'company':
      return content.industry || content.sector || '';
    default:
      return '';
  }
};

/**
 * بناء بيانات المشاركة (بدون UTM - للرابط النظيف)
 */
export const createShareData = (content, contentType = 'job') => {
  const id = content?._id || content?.id;
  const url = getContentUrl(contentType, id);
  const title = getContentTitle(content, contentType);
  const subtitle = getContentSubtitle(content, contentType);

  return {
    title: subtitle ? `${title} - ${subtitle}` : title,
    text: subtitle ? `${title} - ${subtitle}` : title,
    url,
  };
};

/**
 * Detect if the current device is a mobile device
 */
export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if the current browser is iOS Safari.
 * iOS Safari supports navigator.share() but NOT navigator.canShare().
 * navigator.share() must be called directly from a user gesture.
 * Requires HTTPS (or localhost) to work.
 */
export const isIOSSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  // Safari on iOS does not include "Chrome" or "CriOS" or "FxiOS"
  const isSafari = isIOS && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
  return isSafari;
};

/**
 * Detect if the current browser is Android Chrome.
 *
 * Android Chrome compatibility notes:
 * - Web Share API (navigator.share) supported since Chrome 61 (Android)
 * - navigator.share() CAN be called from useEffect (unlike iOS Safari)
 * - navigator.canShare() is supported (unlike iOS Safari)
 * - WhatsApp deep link (whatsapp://) works correctly on Android
 * - Touch targets must be >= 44x44px (enforced via CSS)
 * - Bottom-sheet modal layout is optimal for Android screen sizes
 */
export const isAndroidChrome = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  // Chrome on Android includes "Chrome/" but not "OPR" (Opera) or "EdgA" (Edge)
  const isChrome = /Chrome\/\d+/i.test(ua) && !/OPR|EdgA|SamsungBrowser/i.test(ua);
  return isAndroid && isChrome;
};

/**
 * Check if the page is served over HTTPS (required by iOS Safari for navigator.share).
 */
export const isSecureContext = () => {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext === true || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Check if navigator.share is available.
 * NOTE: iOS Safari does NOT support navigator.canShare() — only check navigator.share.
 */
export const isNativeShareSupported = () => {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
};

/**
 * Determine whether to use the native Web Share API.
 * On iOS Safari: requires HTTPS and must be called directly from a user gesture.
 * Do NOT call navigator.share() from useEffect or any async-delayed context on iOS.
 */
export const shouldUseNativeShare = () => {
  if (!isMobileDevice()) return false;
  if (!isNativeShareSupported()) return false;
  // iOS Safari requires a secure context for navigator.share
  if (isIOSSafari() && !isSecureContext()) return false;
  return true;
};

// ─── Share Methods ────────────────────────────────────────────────────────────

/**
 * Req 5: مشاركة عبر المحادثة الداخلية
 * يُعالج في ShareModal عبر ContactSelector
 */

/**
 * Req 6: مشاركة عبر Facebook مع UTM params + Open Graph
 */
export const shareViaFacebook = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'facebook', 'social');
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(utmUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'facebook', contentType);
};

/**
 * Req 7: مشاركة عبر Twitter مع 280 حرف + hashtags + UTM params
 */
export const shareViaTwitter = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'twitter', 'social');

  // Hashtags based on content type
  const hashtagMap = {
    job: '#وظائف #Careerak #Jobs',
    course: '#تدريب #Careerak #Courses',
    profile: '#Careerak',
    company: '#Careerak #Companies',
  };
  const hashtags = hashtagMap[contentType] || '#Careerak';

  // Enforce 280 char limit: url (~50) + hashtags (~30) + spaces = ~85 reserved
  const maxTextLength = 280 - utmUrl.length - hashtags.length - 3; // 3 for spaces
  let tweetText = shareData.text;
  if (tweetText.length > maxTextLength) {
    tweetText = tweetText.substring(0, maxTextLength - 3) + '...';
  }

  const fullText = `${tweetText} ${hashtags}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(utmUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'twitter', contentType);
};

/**
 * Req 8: مشاركة عبر LinkedIn مع UTM params
 */
export const shareViaLinkedIn = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'linkedin', 'social');
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(utmUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'linkedin', contentType);
};

/**
 * Req 9: مشاركة عبر WhatsApp
 * - موبايل: whatsapp:// deep link
 * - ديسكتوب: web.whatsapp.com
 */
export const shareViaWhatsApp = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'whatsapp', 'messaging');
  const message = encodeURIComponent(`${shareData.text}\n${utmUrl}`);

  if (isMobileDevice()) {
    window.location.href = `whatsapp://send?text=${message}`;
  } else {
    window.open(`https://web.whatsapp.com/send?text=${message}`, '_blank', 'width=600,height=400');
  }
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'whatsapp', contentType);
};

/**
 * Req 10: مشاركة عبر Telegram مع UTM params
 */
export const shareViaTelegram = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'telegram', 'messaging');
  const url = `https://t.me/share/url?url=${encodeURIComponent(utmUrl)}&text=${encodeURIComponent(shareData.text)}`;
  window.open(url, '_blank', 'width=600,height=400');
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'telegram', contentType);
};

/**
 * Req 11: مشاركة عبر البريد الإلكتروني مع UTM params + call-to-action
 */
export const shareViaEmail = (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const utmUrl = addUtmParams(shareData.url, 'email', 'email');

  const subjectMap = {
    job: `فرصة عمل: ${shareData.title}`,
    course: `دورة تدريبية: ${shareData.title}`,
    profile: `ملف شخصي: ${shareData.title}`,
    company: `شركة: ${shareData.title}`,
  };
  const subject = subjectMap[contentType] || shareData.title;

  const body = `${shareData.text}\n\nاضغط على الرابط للاطلاع على التفاصيل:\n${utmUrl}\n\nتم الإرسال عبر Careerak`;

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const id = content?._id || content?.id;
  if (id) trackShare(id, 'email', contentType);
};

/**
 * Req 12: نسخ الرابط النظيف إلى الحافظة
 * @returns {{ success: boolean, fallback: boolean, url: string }}
 */
export const copyShareLink = async (content, contentType = 'job') => {
  const shareData = createShareData(content, contentType);
  const result = await copyToClipboard(shareData.url);
  const id = content?._id || content?.id;
  if (result.success && id) trackShare(id, 'copy_link', contentType);
  return { ...result, url: shareData.url };
};

// ─── Legacy helpers (kept for backward compatibility) ───────────────────────

/** @deprecated Use getContentUrl('job', jobId) instead */
export const getJobUrl = (jobId) => getContentUrl('job', jobId);

export const shareNative = async (job) => {
  // iOS Safari: only check navigator.share (not navigator.canShare — unsupported on iOS)
  if (!isNativeShareSupported()) return false;
  try {
    const shareData = createShareData(job, 'job');
    // navigator.share() must be called directly from a user gesture handler.
    // Do NOT call this from useEffect or any async-delayed context on iOS Safari.
    await navigator.share(shareData);
    await trackShare(job._id || job.id, 'native', 'job');
    return true;
  } catch (error) {
    if (error.name !== 'AbortError') console.error('Error sharing:', error);
    return false;
  }
};

export const shareWhatsApp = (job) => shareViaWhatsApp(job, 'job');
export const shareLinkedIn = (job) => shareViaLinkedIn(job, 'job');
export const shareTwitter = (job) => shareViaTwitter(job, 'job');
export const shareFacebook = (job) => shareViaFacebook(job, 'job');

export const shareCopy = async (job) => {
  const result = await copyShareLink(job, 'job');
  return result.success;
};

export const shareJob = async (job, platform) => {
  switch (platform) {
    case 'native': return await shareNative(job);
    case 'copy': return await shareCopy(job);
    case 'whatsapp': shareViaWhatsApp(job); return true;
    case 'linkedin': shareViaLinkedIn(job); return true;
    case 'twitter': shareViaTwitter(job); return true;
    case 'facebook': shareViaFacebook(job); return true;
    default: console.error('Unknown share platform:', platform); return false;
  }
};
