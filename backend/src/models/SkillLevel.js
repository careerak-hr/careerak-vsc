const mongoose = require('mongoose');

const skillLevelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    levelPercentage: { type: Number, default: 25 }, // 25, 50, 75, 100
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool'],
      default: 'technical'
    },
    yearsOfExperience: Number,
    certificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }, // Optional reference to a certification
    order: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SkillLevel', skillLevelSchema);
