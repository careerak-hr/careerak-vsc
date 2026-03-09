const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const ActiveSession = require('../models/ActiveSession');

/**
 * Password Change Service
 * 
 * Handles password change operations including:
 * - Verifying current password
 * - Validating new password strength
 * - Changing password with encryption
 * - Invalidating other sessions
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
class PasswordChangeService {
  /**
   * Verify current password
   * 
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password to verify
   * @returns {Promise<{valid: boolean, message?: string}>}
   * 
   * Requirement 5.1: System SHALL require current password
   */
  async verifyCurrentPassword(userId, currentPassword) {
    try {
      // Validate inputs
      if (!userId || !currentPassword) {
        return {
          valid: false,
          message: 'معرف المستخدم وكلمة المرور الحالية مطلوبان'
        };
      }

      // Find user
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return {
          valid: false,
          message: 'المستخدم غير موجود'
        };
      }

      // Compare password
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return {
          valid: false,
          message: 'كلمة المرور الحالية غير صحيحة'
        };
      }

      return {
        valid: true
      };
    } catch (error) {
      console.error('Error verifying current password:', error);
      throw new Error('فشل التحقق من كلمة المرور الحالية');
    }
  }

  /**
   * Validate new password strength
   * 
   * @param {string} newPassword - New password to validate
   * @returns {Promise<{valid: boolean, message?: string, strength?: object}>}
   * 
   * Requirement 5.2: System SHALL validate new password strength
   * (min 8 chars, uppercase, lowercase, number, special char)
   */
  async validateNewPassword(newPassword) {
    try {
      // Validate input
      if (!newPassword) {
        return {
          valid: false,
          message: 'كلمة المرور الجديدة مطلوبة'
        };
      }

      const errors = [];
      let score = 0;

      // Check minimum length (8 characters)
      if (newPassword.length < 8) {
        errors.push('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل');
      } else {
        score++;
      }

      // Check for uppercase letter
      if (!/[A-Z]/.test(newPassword)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل');
      } else {
        score++;
      }

      // Check for lowercase letter
      if (!/[a-z]/.test(newPassword)) {
        errors.push('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل');
      } else {
        score++;
      }

      // Check for number
      if (!/[0-9]/.test(newPassword)) {
        errors.push('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');
      } else {
        score++;
      }

      // Check for special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        errors.push('يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل');
      }

      // Determine strength label (score 0-4 to match User model)
      let label = 'none';
      if (score === 4 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        label = 'strong'; // All 5 requirements met
      } else if (score === 4) {
        label = 'good'; // 4 requirements met
      } else if (score === 3) {
        label = 'fair'; // 3 requirements met
      } else if (score >= 1) {
        label = 'weak'; // 1-2 requirements met
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: errors.join('. '),
          strength: {
            score,
            label
          }
        };
      }

      return {
        valid: true,
        strength: {
          score,
          label
        }
      };
    } catch (error) {
      console.error('Error validating new password:', error);
      throw new Error('فشل التحقق من صحة كلمة المرور الجديدة');
    }
  }

  /**
   * Change password
   * 
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} currentSessionId - Current session ID (to keep active)
   * @returns {Promise<{success: boolean, message: string, sessionsInvalidated?: number}>}
   * 
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  async changePassword(userId, currentPassword, newPassword, currentSessionId = null) {
    try {
      // Step 1: Verify current password (Requirement 5.1)
      const verifyResult = await this.verifyCurrentPassword(userId, currentPassword);
      if (!verifyResult.valid) {
        return {
          success: false,
          message: verifyResult.message
        };
      }

      // Step 2: Validate new password strength (Requirement 5.2)
      const validateResult = await this.validateNewPassword(newPassword);
      if (!validateResult.valid) {
        return {
          success: false,
          message: validateResult.message
        };
      }

      // Step 3: Check if new password is same as current
      const user = await User.findById(userId).select('+password');
      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        return {
          success: false,
          message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية'
        };
      }

      // Step 4: Hash and save new password (Requirement 5.3)
      user.password = newPassword;
      user.passwordStrength = validateResult.strength;
      await user.save(); // pre-save hook will hash the password

      // Step 5: Invalidate all other sessions (Requirement 5.4)
      const sessionsInvalidated = await this.invalidateOtherSessions(userId, currentSessionId);

      return {
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح',
        sessionsInvalidated
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('فشل تغيير كلمة المرور');
    }
  }

  /**
   * Invalidate all other sessions except current
   * 
   * @param {string} userId - User ID
   * @param {string} currentSessionId - Current session ID to keep active
   * @returns {Promise<number>} Number of sessions invalidated
   * 
   * Requirement 5.4: Session_Manager SHALL invalidate all other sessions except current
   */
  async invalidateOtherSessions(userId, currentSessionId = null) {
    try {
      const result = await ActiveSession.invalidateUserSessions(userId, currentSessionId);
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error invalidating other sessions:', error);
      throw new Error('فشل إنهاء الجلسات الأخرى');
    }
  }
}

module.exports = PasswordChangeService;
