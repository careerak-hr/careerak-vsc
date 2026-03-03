const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  searchType: {
    type: String,
    enum: ['jobs', 'courses'],
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed
  },
  resultCount: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index للبحث السريع
searchHistorySchema.index({ userId: 1, searchType: 1, timestamp: -1 });
searchHistorySchema.index({ query: 1, searchType: 1 });

// TTL Index: حذف السجلات بعد 90 يوم
searchHistorySchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
