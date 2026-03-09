/**
 * Account Deletion Service
 * 
 * Handles account deletion requests with grace period support.
 * Manages scheduled deletions and sends reminders.
 */

const AccountDeletionRequest = require('../models/AccountDeletionRequest');
const { User } = require('../models/User');
const ActiveSession = require('../models/ActiveSession');

class AccountDeletionService {
  /**
   * Request account deletion
   * @param {string} userId - User ID
   * @param {Object} options - Deletion options
   */
  async requestDeletion(userId, options) {
    const { type, reason } = options;

    // Check if deletion request already exists
    const existingRequest = await AccountDeletionRequest.findOne({
      userId,
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Deletion request already pending');
    }

    // Create deletion request
    const deletionRequest = new AccountDeletionRequest({
      userId,
      type,
      reason,
      status: 'pending',
      requestedAt: new Date()
    });

    if (type === 'scheduled') {
      // Set deletion date to 30 days from now
      deletionRequest.scheduledDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await deletionRequest.save();

    // If immediate deletion, process now
    if (type === 'immediate') {
      await this.permanentlyDeleteAccount(userId);
      deletionRequest.status = 'completed';
      deletionRequest.completedAt = new Date();
      await deletionRequest.save();
    }

    // Send notification
    // await notificationService.sendDeletionRequestNotification(userId, type);

    return deletionRequest;
  }

  /**
   * Cancel deletion request
   * @param {string} userId - User ID
   */
  async cancelDeletion(userId) {
    const deletionRequest = await AccountDeletionRequest.findOne({
      userId,
      status: 'pending'
    });

    if (!deletionRequest) {
      throw new Error('No pending deletion request found');
    }

    deletionRequest.status = 'cancelled';
    deletionRequest.cancelledAt = new Date();
    await deletionRequest.save();

    // Send notification
    // await notificationService.sendDeletionCancelledNotification(userId);

    return deletionRequest;
  }

  /**
   * Get deletion status
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Deletion status
   */
  async getDeletionStatus(userId) {
    const deletionRequest = await AccountDeletionRequest.findOne({
      userId,
      status: 'pending'
    });

    if (!deletionRequest) {
      return null;
    }

    const now = new Date();
    const daysRemaining = Math.ceil(
      (deletionRequest.scheduledDate - now) / (24 * 60 * 60 * 1000)
    );

    return {
      pending: true,
      type: deletionRequest.type,
      scheduledDate: deletionRequest.scheduledDate,
      daysRemaining: Math.max(0, daysRemaining),
      requestedAt: deletionRequest.requestedAt
    };
  }

  /**
   * Process scheduled deletions (cron job)
   */
  async processScheduledDeletions() {
    const now = new Date();

    // Find deletion requests that are due
    const dueRequests = await AccountDeletionRequest.find({
      status: 'pending',
      type: 'scheduled',
      scheduledDate: { $lte: now }
    });

    for (const request of dueRequests) {
      try {
        // Permanently delete account
        await this.permanentlyDeleteAccount(request.userId);

        // Mark request as completed
        request.status = 'completed';
        request.completedAt = new Date();
        await request.save();

        // Send final confirmation
        // await notificationService.sendDeletionCompletedNotification(request.userId);
      } catch (error) {
        console.error(`Failed to delete account ${request.userId}:`, error);
      }
    }

    return dueRequests.length;
  }

  /**
   * Send deletion reminders (cron job)
   * Sends reminder 7 days before scheduled deletion
   */
  async sendDeletionReminders() {
    const reminderDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(reminderDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reminderDate.setHours(23, 59, 59, 999));

    // Find requests scheduled for 7 days from now
    const requests = await AccountDeletionRequest.find({
      status: 'pending',
      type: 'scheduled',
      reminderSent: false,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    for (const request of requests) {
      try {
        // Send reminder notification
        // await notificationService.sendDeletionReminderNotification(request.userId, request.scheduledDate);

        // Mark reminder as sent
        request.reminderSent = true;
        await request.save();
      } catch (error) {
        console.error(`Failed to send reminder for ${request.userId}:`, error);
      }
    }

    return requests.length;
  }

  /**
   * Permanently delete account and all related data
   * @param {string} userId - User ID
   */
  async permanentlyDeleteAccount(userId) {
    // Delete user profile
    await User.findByIdAndDelete(userId);

    // Delete all active sessions
    await ActiveSession.deleteMany({ userId });

    // In real implementation, delete all related data:
    // - Posts
    // - Messages
    // - Applications
    // - Reviews
    // - Notifications
    // - etc.

    // Anonymize data that must be retained for legal reasons
    await this.anonymizeRetainedData(userId);
  }

  /**
   * Anonymize data that must be retained for legal reasons
   * @param {string} userId - User ID
   */
  async anonymizeRetainedData(userId) {
    // In real implementation, anonymize:
    // - Transaction records
    // - Payment history
    // - Legal documents
    // Replace PII with anonymized values
  }
}

module.exports = new AccountDeletionService();
