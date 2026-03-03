#!/usr/bin/env node

/**
 * Script: Cleanup Expired Recordings
 * سكريبت لحذف التسجيلات المنتهية يدوياً
 * 
 * Usage:
 *   node scripts/cleanup-expired-recordings.js
 * 
 * Requirements: 2.6
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { runDeleteExpiredRecordings } = require('../src/jobs/deleteExpiredRecordings');

/**
 * الاتصال بقاعدة البيانات
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * تشغيل السكريبت
 */
const main = async () => {
  console.log('='.repeat(60));
  console.log('Cleanup Expired Recordings Script');
  console.log('='.repeat(60));
  console.log();

  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    // تشغيل مهمة الحذف
    const results = await runDeleteExpiredRecordings();

    console.log();
    console.log('='.repeat(60));
    console.log('Cleanup Results:');
    console.log('='.repeat(60));
    console.log(`Total expired recordings: ${results.total}`);
    console.log(`Successfully deleted: ${results.deleted}`);
    console.log(`Failed to delete: ${results.failed}`);
    console.log();

    if (results.failed > 0) {
      console.log('Errors:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. Recording ${error.recordingId}: ${error.error}`);
      });
      console.log();
    }

    console.log('✓ Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Cleanup failed:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
main();
