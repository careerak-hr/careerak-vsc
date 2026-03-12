const axios = require('axios');
const Certificate = require('../models/Certificate');
const { User } = require('../models/User');

/**
 * LinkedIn Service
 * يوفر تكامل مع LinkedIn API لمشاركة الشهادات
 */
class LinkedInService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.FRONTEND_URL}/linkedin/callback`;
    this.apiBaseUrl = 'https://api.linkedin.com/v2';
  }

  /**
   * توليد رابط OAuth للمصادقة
   * @param {string} state - State parameter للأمان
   * @returns {string} رابط OAuth
   */
  getAuthorizationUrl(state) {
    const scope = 'r_liteprofile w_member_social';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: scope
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * تبديل authorization code بـ access token
   * @param {string} code - Authorization code من LinkedIn
   * @returns {Promise<Object>} Access token وبيانات أخرى
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token || null
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * الحصول على معلومات المستخدم من LinkedIn
   * @param {string} accessToken - LinkedIn access token
   * @returns {Promise<Object>} معلومات المستخدم
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return {
        success: true,
        profile: {
          id: response.data.id,
          firstName: response.data.localizedFirstName,
          lastName: response.data.localizedLastName
        }
      };
    } catch (error) {
      console.error('Error getting user profile:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn user profile');
    }
  }

  /**
   * مشاركة الشهادة على LinkedIn كمنشور
   * @param {string} accessToken - LinkedIn access token
   * @param {string} certificateId - معرف الشهادة
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} نتيجة المشاركة
   */
  async shareCertificateAsPost(accessToken, certificateId, userId) {
    try {
      // الحصول على بيانات الشهادة
      const certificate = await Certificate.getByCertificateId(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (!certificate.isValid()) {
        throw new Error('Certificate is not valid');
      }

      // الحصول على معلومات المستخدم من LinkedIn
      const linkedInProfile = await this.getUserProfile(accessToken);
      const linkedInUserId = linkedInProfile.profile.id;

      // تحضير محتوى المنشور
      const postText = this._generatePostText(certificate);
      const certificateUrl = certificate.verificationUrl;

      // إنشاء منشور على LinkedIn
      const shareResponse = await axios.post(
        `${this.apiBaseUrl}/ugcPosts`,
        {
          author: `urn:li:person:${linkedInUserId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: postText
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: certificateUrl,
                  title: {
                    text: `${certificate.courseName} - Certificate`
                  },
                  description: {
                    text: `Issued by Careerak on ${new Date(certificate.issueDate).toLocaleDateString()}`
                  }
                }
              ]
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      // تحديث الشهادة لتحديد أنها تمت مشاركتها
      certificate.markAsShared();
      await certificate.save();

      return {
        success: true,
        message: 'Certificate shared successfully on LinkedIn',
        messageAr: 'تم مشاركة الشهادة بنجاح على LinkedIn',
        postId: shareResponse.data.id,
        postUrl: `https://www.linkedin.com/feed/update/${shareResponse.data.id}`
      };
    } catch (error) {
      console.error('Error sharing certificate on LinkedIn:', error.response?.data || error.message);
      throw new Error('Failed to share certificate on LinkedIn');
    }
  }

  /**
   * إضافة الشهادة إلى قسم Certifications في الملف الشخصي
   * @param {string} accessToken - LinkedIn access token
   * @param {string} certificateId - معرف الشهادة
   * @returns {Promise<Object>} نتيجة الإضافة
   */
  async addToCertifications(accessToken, certificateId) {
    try {
      // الحصول على بيانات الشهادة
      const certificate = await Certificate.getByCertificateId(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (!certificate.isValid()) {
        throw new Error('Certificate is not valid');
      }

      // الحصول على معلومات المستخدم من LinkedIn
      const linkedInProfile = await this.getUserProfile(accessToken);
      const linkedInUserId = linkedInProfile.profile.id;

      // إضافة الشهادة إلى قسم Certifications
      // ملاحظة: LinkedIn API v2 لا يدعم إضافة certifications مباشرة
      // يجب استخدام LinkedIn Profile API أو طلب من المستخدم إضافتها يدوياً
      
      // بدلاً من ذلك، نقوم بمشاركة منشور مع رابط الشهادة
      const result = await this.shareCertificateAsPost(accessToken, certificateId, certificate.userId);

      return {
        success: true,
        message: 'Certificate shared on LinkedIn. Please add it manually to your Certifications section.',
        messageAr: 'تم مشاركة الشهادة على LinkedIn. يرجى إضافتها يدوياً إلى قسم الشهادات في ملفك الشخصي.',
        ...result
      };
    } catch (error) {
      console.error('Error adding certificate to certifications:', error.response?.data || error.message);
      throw new Error('Failed to add certificate to LinkedIn certifications');
    }
  }

  /**
   * توليد نص المنشور للشهادة
   * @param {Object} certificate - بيانات الشهادة
   * @returns {string} نص المنشور
   * @private
   */
  _generatePostText(certificate) {
    const userName = `${certificate.userId.firstName} ${certificate.userId.lastName}`;
    const courseName = certificate.courseName;
    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🎓 I'm excited to share that I've successfully completed "${courseName}"!\n\n` +
           `This certificate was issued by Careerak on ${issueDate}.\n\n` +
           `You can verify this certificate here: ${certificate.verificationUrl}\n\n` +
           `#Careerak #ProfessionalDevelopment #Learning #Certificate`;
  }

  /**
   * التحقق من صلاحية access token
   * @param {string} accessToken - LinkedIn access token
   * @returns {Promise<boolean>} true إذا كان صالحاً
   */
  async validateAccessToken(accessToken) {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * إلغاء ربط حساب LinkedIn
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} نتيجة الإلغاء
   */
  async unlinkAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // حذف بيانات LinkedIn من المستخدم
      if (user.linkedInProfile) {
        user.linkedInProfile = undefined;
        await user.save();
      }

      return {
        success: true,
        message: 'LinkedIn account unlinked successfully',
        messageAr: 'تم إلغاء ربط حساب LinkedIn بنجاح'
      };
    } catch (error) {
      console.error('Error unlinking LinkedIn account:', error);
      throw error;
    }
  }

  /**
   * حفظ access token في قاعدة البيانات
   * @param {string} userId - معرف المستخدم
   * @param {string} accessToken - LinkedIn access token
   * @param {number} expiresIn - مدة صلاحية التوكن بالثواني
   * @returns {Promise<Object>} نتيجة الحفظ
   */
  async saveAccessToken(userId, accessToken, expiresIn) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // حساب تاريخ انتهاء الصلاحية
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // حفظ التوكن في الملف الشخصي
      user.linkedInProfile = {
        accessToken: accessToken,
        expiresAt: expiresAt,
        connectedAt: new Date()
      };

      await user.save();

      return {
        success: true,
        message: 'LinkedIn access token saved successfully',
        messageAr: 'تم حفظ توكن LinkedIn بنجاح'
      };
    } catch (error) {
      console.error('Error saving LinkedIn access token:', error);
      throw error;
    }
  }

  /**
   * الحصول على access token من قاعدة البيانات
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<string|null>} Access token أو null
   */
  async getAccessToken(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.linkedInProfile) {
        return null;
      }

      // التحقق من صلاحية التوكن
      if (user.linkedInProfile.expiresAt < new Date()) {
        // التوكن منتهي الصلاحية
        return null;
      }

      return user.linkedInProfile.accessToken;
    } catch (error) {
      console.error('Error getting LinkedIn access token:', error);
      return null;
    }
  }
}

module.exports = new LinkedInService();
