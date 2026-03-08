const mongoose = require('mongoose');

const profileSuggestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  suggestions: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['add', 'improve', 'update'], required: true },
    category: { type: String, enum: ['skills', 'about', 'portfolio', 'experience', 'profile', 'social'], required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String }, // e.g., 💡, ⚠️, ✨
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ProfileSuggestion', profileSuggestionSchema);
