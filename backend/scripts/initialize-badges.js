/**
 * Initialize Badges Script
 * Run this script to initialize all badge definitions in the database
 * 
 * Usage: node scripts/initialize-badges.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const badgeService = require('../src/services/badgeService');

async function initializeBadges() {
  try {
    console.log('🚀 Starting badge initialization...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Initialize badges
    console.log('🎯 Initializing badges...');
    await badgeService.initializeBadges();
    
    console.log('\n✅ Badge initialization completed successfully!');
    console.log('📊 Total badges: 10');
    console.log('   - 🌱 Beginner (Common)');
    console.log('   - 🎓 Active Learner (Common)');
    console.log('   - 🏆 Expert (Rare)');
    console.log('   - ⚡ Speed Learner (Rare)');
    console.log('   - 🌟 Outstanding (Epic)');
    console.log('   - 📚 Specialist (Rare)');
    console.log('   - 🎯 Persistent (Epic)');
    console.log('   - 💼 Professional (Legendary)');
    console.log('   - 📜 Certificate Collector (Epic)');
    console.log('   - 🎨 Skills Master (Legendary)');
    
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
initializeBadges();
