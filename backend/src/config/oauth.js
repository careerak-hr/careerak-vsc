/**
 * OAuth Configuration
 * إعدادات OAuth للمنصات المختلفة
 * 
 * ملاحظة: يجب إضافة المفاتيح في ملف .env
 * 
 * المتغيرات المطلوبة:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - FACEBOOK_APP_ID
 * - FACEBOOK_APP_SECRET
 * - LINKEDIN_CLIENT_ID
 * - LINKEDIN_CLIENT_SECRET
 * - OAUTH_CALLBACK_URL (مثال: http://localhost:5000/auth)
 */

module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/auth'}/google/callback`,
    scope: ['profile', 'email']
  },
  
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/auth'}/facebook/callback`,
    profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
  },
  
  linkedin: {
    clientID: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    callbackURL: `${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/auth'}/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile']
  }
};
