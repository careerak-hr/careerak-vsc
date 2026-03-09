const ActiveSession = require('../models/ActiveSession');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');

class SessionService {
  /**
   * Get all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of active sessions
   */
  async getActiveSessions(userId) {
    try {
      const sessions = await ActiveSession.find({
        userId,
        expiresAt: { $gt: new Date() }
      }).sort({ loginTime: -1 });

      return sessions.map(session => ({
        id: session._id.toString(),
        deviceType: session.device.type,
        os: session.device.os,
        browser: session.device.browser,
        ipAddress: session.location.ipAddress,
        location: session.location.city && session.location.country 
          ? `${session.location.city}, ${session.location.country}`
          : session.location.country || 'Unknown',
        loginTime: session.loginTime,
        lastActivity: session.lastActivity,
        isCurrent: false, // Will be set by controller based on current token
        isTrusted: session.isTrusted
      }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw new Error('Failed to retrieve active sessions');
    }
  }

  /**
   * Logout a specific session
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID to logout
   * @returns {Promise<boolean>} Success status
   */
  async logoutSession(userId, sessionId) {
    try {
      const result = await ActiveSession.deleteOne({
        _id: sessionId,
        userId
      });

      if (result.deletedCount === 0) {
        throw new Error('Session not found or already logged out');
      }

      return true;
    } catch (error) {
      console.error('Error logging out session:', error);
      throw error;
    }
  }

  /**
   * Logout all other sessions except the current one
   * @param {string} userId - User ID
   * @param {string} currentSessionId - Current session ID to keep
   * @returns {Promise<number>} Number of sessions logged out
   */
  async logoutAllOtherSessions(userId, currentSessionId) {
    try {
      const result = await ActiveSession.deleteMany({
        userId,
        _id: { $ne: currentSessionId }
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error logging out all other sessions:', error);
      throw new Error('Failed to logout other sessions');
    }
  }

  /**
   * Get login history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of entries to return
   * @param {Object} filters - Optional filters (startDate, endDate, success)
   * @returns {Promise<Array>} Array of login attempts
   */
  async getLoginHistory(userId, limit = 50, filters = {}) {
    try {
      const query = { userId };

      // Apply filters
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.timestamp.$lte = new Date(filters.endDate);
        }
      }

      if (filters.success !== undefined) {
        query.success = filters.success;
      }

      if (filters.deviceType) {
        query['device.type'] = filters.deviceType;
      }

      const history = await LoginHistory.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);

      return history.map(entry => ({
        timestamp: entry.timestamp,
        device: entry.device.type || 'Unknown',
        os: entry.device.os,
        browser: entry.device.browser,
        location: entry.location.city && entry.location.country
          ? `${entry.location.city}, ${entry.location.country}`
          : entry.location.country || 'Unknown',
        ipAddress: entry.location.ipAddress,
        success: entry.success,
        failureReason: entry.failureReason
      }));
    } catch (error) {
      console.error('Error getting login history:', error);
      throw new Error('Failed to retrieve login history');
    }
  }

  /**
   * Log a login attempt
   * @param {Object} attemptData - Login attempt data
   * @returns {Promise<Object>} Created login history entry
   */
  async logLoginAttempt(attemptData) {
    try {
      const {
        userId,
        success,
        failureReason,
        device,
        location
      } = attemptData;

      const loginEntry = new LoginHistory({
        userId,
        success,
        failureReason,
        device: {
          type: device?.type || 'unknown',
          os: device?.os,
          browser: device?.browser
        },
        location: {
          ipAddress: location?.ipAddress || 'unknown',
          country: location?.country,
          city: location?.city
        }
      });

      await loginEntry.save();
      return loginEntry;
    } catch (error) {
      console.error('Error logging login attempt:', error);
      throw new Error('Failed to log login attempt');
    }
  }

  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const {
        userId,
        token,
        device,
        location,
        expiresIn = 30 * 24 * 60 * 60 * 1000 // 30 days default
      } = sessionData;

      const expiresAt = new Date(Date.now() + expiresIn);

      const session = new ActiveSession({
        userId,
        token,
        device: {
          type: device?.type || 'unknown',
          os: device?.os,
          browser: device?.browser,
          fingerprint: device?.fingerprint
        },
        location: {
          ipAddress: location?.ipAddress || 'unknown',
          country: location?.country,
          city: location?.city,
          coordinates: location?.coordinates
        },
        expiresAt,
        isTrusted: device?.isTrusted || false
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Update session activity
   * @param {string} token - Session token
   * @returns {Promise<boolean>} Success status
   */
  async updateSessionActivity(token) {
    try {
      const result = await ActiveSession.updateOne(
        { token },
        { lastActivity: new Date() }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  }

  /**
   * Get session by token
   * @param {string} token - Session token
   * @returns {Promise<Object|null>} Session or null
   */
  async getSessionByToken(token) {
    try {
      return await ActiveSession.findOne({
        token,
        expiresAt: { $gt: new Date() }
      });
    } catch (error) {
      console.error('Error getting session by token:', error);
      return null;
    }
  }

  /**
   * Cleanup expired sessions (cron job)
   * @returns {Promise<number>} Number of sessions cleaned up
   */
  async cleanupExpiredSessions() {
    try {
      const result = await ActiveSession.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`Cleaned up ${result.deletedCount} expired sessions`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw new Error('Failed to cleanup expired sessions');
    }
  }

  /**
   * Cleanup sessions inactive for more than 30 days
   * @returns {Promise<number>} Number of sessions cleaned up
   */
  async cleanupInactiveSessions() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await ActiveSession.deleteMany({
        lastActivity: { $lt: thirtyDaysAgo }
      });

      console.log(`Cleaned up ${result.deletedCount} inactive sessions`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up inactive sessions:', error);
      throw new Error('Failed to cleanup inactive sessions');
    }
  }

  /**
   * Delete all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of sessions deleted
   */
  async deleteAllUserSessions(userId) {
    try {
      const result = await ActiveSession.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting all user sessions:', error);
      throw new Error('Failed to delete user sessions');
    }
  }

  /**
   * Get session count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of active sessions
   */
  async getSessionCount(userId) {
    try {
      return await ActiveSession.countDocuments({
        userId,
        expiresAt: { $gt: new Date() }
      });
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }
}

module.exports = new SessionService();
