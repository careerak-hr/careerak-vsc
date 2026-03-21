const Share = require('../models/Share');
const ShareAnalytics = require('../models/ShareAnalytics');

// URL path segments per content type (used for direct SPA links)
const CONTENT_TYPE_PATHS = {
  job: 'job-postings',
  course: 'courses',
  profile: 'profile',
  company: 'companies'
};

// Share HTML route segments per content type (served by backend with OG/Twitter meta tags)
const SHARE_HTML_PATHS = {
  job: 'share/job',
  course: 'share/course',
  profile: 'share/profile',
  company: 'share/company'
};

const VALID_CONTENT_TYPES = ['job', 'course', 'profile', 'company'];
const VALID_SHARE_METHODS = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'internal_chat', 'native'];

// External (social/messaging/email) share methods
const EXTERNAL_METHODS = new Set(['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email']);

// UTM medium mapping per share method
const UTM_MEDIUM = {
  facebook: 'social',
  twitter: 'social',
  linkedin: 'social',
  whatsapp: 'messaging',
  telegram: 'messaging',
  email: 'email'
};

/**
 * Generate a share link for a content item.
 * Req 13
 *
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {string} contentId
 * @param {string} shareMethod - e.g. 'facebook', 'copy_link', 'internal_chat'
 * @param {object} [options] - optional overrides
 * @returns {{ url: string, utmParams: object|null }}
 */
exports.generateShareLink = (contentType, contentId, shareMethod, options = {}) => {
  const path = CONTENT_TYPE_PATHS[contentType];
  if (!path) {
    throw new Error(`Invalid contentType: ${contentType}`);
  }

  // For external social media shares, use the /share/ route so crawlers get OG/Twitter meta tags
  const isExternal = EXTERNAL_METHODS.has(shareMethod);
  const sharePath = isExternal ? SHARE_HTML_PATHS[contentType] : path;
  const baseUrl = `https://careerak.com/${sharePath}/${contentId}`;

  if (!isExternal) {
    return { url: baseUrl, utmParams: null };
  }

  const utmParams = {
    utm_source: shareMethod,
    utm_medium: UTM_MEDIUM[shareMethod],
    utm_campaign: `share_${contentType}`
  };

  const queryString = Object.entries(utmParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  return {
    url: `${baseUrl}?${queryString}`,
    utmParams
  };
};

/**
 * Record a share event.
 * Req 15
 *
 * @param {object} data
 * @param {string} data.contentType
 * @param {string} data.contentId
 * @param {string} [data.userId]
 * @param {string} data.shareMethod
 * @param {string} [data.ip]
 * @param {string} [data.userAgent]
 * @returns {Promise<Document>} saved Share document
 */
exports.recordShare = async (data) => {
  const { contentType, contentId, userId, shareMethod, ip, userAgent } = data;

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Invalid contentType: ${contentType}`);
  }
  if (!VALID_SHARE_METHODS.includes(shareMethod)) {
    throw new Error(`Invalid shareMethod: ${shareMethod}`);
  }

  try {
    const share = new Share({
      contentType,
      contentId,
      userId: userId || undefined,
      shareMethod,
      ip: ip || undefined,
      userAgent: userAgent || undefined
    });

    const saved = await share.save();

    // Fire-and-forget analytics increment (non-blocking)
    ShareAnalytics.incrementShare(contentType, contentId, shareMethod).catch(() => {});

    // If internal chat share, notify the recipient (handled by chat controller)
    // Notification is sent from ContactSelector after message is sent

    return saved;
  } catch (error) {
    throw new Error(`Failed to record share: ${error.message}`);
  }
};

/**
 * Get share analytics for a content item.
 * Req 15
 *
 * @param {string} contentType
 * @param {string} contentId
 * @returns {Promise<{ totalShares: number, sharesByMethod: Array, analytics: Document|null }>}
 */
exports.getShareAnalytics = async (contentType, contentId) => {
  try {
    const [analytics, totalShares, sharesByMethod] = await Promise.all([
      ShareAnalytics.getAnalytics(contentType, contentId),
      Share.getShareCount(contentType, contentId),
      Share.getSharesByMethod(contentType, contentId)
    ]);

    return { totalShares, sharesByMethod, analytics };
  } catch (error) {
    throw new Error(`Failed to get share analytics: ${error.message}`);
  }
};

/**
 * Validate whether sharing is permitted.
 * Req 17
 *
 * @param {string} contentType
 * @param {string} contentId
 * @param {string} userId - the user attempting to share
 * @param {boolean} isExternal - true for external (social/email) shares
 * @returns {Promise<{ allowed: boolean, reason: string }>}
 */
exports.validateSharePermissions = async (contentType, contentId, userId, isExternal) => {
  // Jobs, courses, and companies are always public
  if (contentType !== 'profile') {
    return { allowed: true, reason: 'Public content' };
  }

  // For profile shares, check privacy settings when sharing externally
  if (!isExternal) {
    return { allowed: true, reason: 'Internal share allowed' };
  }

  try {
    const { User } = require('../models/User');
    const user = await User.findById(contentId).select('profileVisibility').lean();

    if (!user) {
      return { allowed: false, reason: 'Profile not found' };
    }

    // Check UserSettings for profileVisibility
    const UserSettings = require('../models/UserSettings');
    const settings = await UserSettings.findOne({ userId: contentId }).select('privacy.profileVisibility').lean();

    const visibility = settings?.privacy?.profileVisibility || 'everyone';

    if (visibility === 'none') {
      return { allowed: false, reason: 'Profile is private and cannot be shared externally' };
    }

    return { allowed: true, reason: 'Profile is publicly shareable' };
  } catch (error) {
    throw new Error(`Failed to validate share permissions: ${error.message}`);
  }
};
