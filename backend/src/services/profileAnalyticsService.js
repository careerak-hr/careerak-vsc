const ProfileView = require('../models/ProfileView');
const { User } = require('../models/User');
const notificationService = require('./notificationService');

/**
 * Profile Analytics Service
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

/**
 * Records a profile view
 */
const trackView = async (profileUserId, viewerData) => {
  const { viewerUserId, viewerType, viewerCompanyName, deviceType } = viewerData;

  const view = new ProfileView({
    profileUserId,
    viewerUserId,
    viewerType,
    viewerCompanyName,
    deviceType,
    timestamp: new Date()
  });

  await view.save();

  // If viewed by a company, notify the user (Requirement 8.4)
  if (viewerType === 'company') {
    await notificationService.createNotification({
      user: profileUserId,
      type: 'system', // or 'profile_view' if defined
      title: 'شركة شاهدت ملفك الشخصي',
      message: `قامت شركة ${viewerCompanyName || 'مجهولة'} بمراجعة ملفك الشخصي مؤخراً.`,
      priority: 'medium'
    });
  }

  return view;
};

/**
 * Gets aggregated analytics for a user
 */
const getAnalytics = async (userId, period = '30') => {
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Total Views in period
  const totalViews = await ProfileView.countDocuments({
    profileUserId: userId,
    timestamp: { $gte: startDate }
  });

  // 2. Unique Viewers
  const uniqueViewers = await ProfileView.distinct('viewerUserId', {
    profileUserId: userId,
    timestamp: { $gte: startDate }
  });

  // 3. Views by Day (for chart)
  const viewsByDay = await ProfileView.aggregate([
    {
      $match: {
        profileUserId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 4. Last 10 Companies (Requirement 8.2)
  const lastCompanies = await ProfileView.find({
    profileUserId: userId,
    viewerType: 'company',
    viewerCompanyName: { $exists: true }
  })
  .sort({ timestamp: -1 })
  .limit(10)
  .select('viewerCompanyName timestamp');

  return {
    summary: {
      totalViews,
      uniqueViewersCount: uniqueViewers.length,
      periodDays: days
    },
    viewsByDay,
    lastCompanies
  };
};

module.exports = {
  trackView,
  getAnalytics
};
