const mongoose = require('mongoose');

const SearchAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  savedSearchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedSearch',
    required: true
  },
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    required: true
  },
  notificationMethod: {
    type: String,
    enum: ['push', 'email', 'both'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  triggerCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SearchAlertSchema.index({ userId: 1, isActive: 1 });
SearchAlertSchema.index({ frequency: 1, lastTriggered: 1 });
SearchAlertSchema.index({ savedSearchId: 1 });

const SearchAlert = mongoose.model('SearchAlert', SearchAlertSchema);

module.exports = SearchAlert;
