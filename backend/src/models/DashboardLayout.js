const mongoose = require('mongoose');

const dashboardLayoutSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  widgets: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'quick_stats',
        'user_chart',
        'job_chart',
        'course_chart',
        'review_chart',
        'recent_users',
        'recent_jobs',
        'recent_applications',
        'activity_log',
        'flagged_reviews',
        'notifications'
      ],
      required: true
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true }
    },
    config: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DashboardLayout', dashboardLayoutSchema);
