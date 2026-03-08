const mongoose = require('mongoose');

const profileCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sections: {
    profilePicture: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 10 } },
    about: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 15 } },
    skills: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 20 } },
    experience: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 20 } },
    education: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 15 } },
    portfolio: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 10 } },
    socialLinks: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 5 } },
    certifications: { completed: { type: Boolean, default: false }, weight: { type: Number, default: 5 } }
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ProfileCompletion', profileCompletionSchema);
