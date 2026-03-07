/**
 * Migration: Add Course Enhancement Fields
 * 
 * This migration adds default values for new enhancement fields
 * to all existing EducationalCourse documents.
 * 
 * Run with: node src/migrations/001_add_course_enhancements.js
 */

const mongoose = require('mongoose');
const EducationalCourse = require('../models/EducationalCourse');
require('dotenv').config();

async function migrate() {
  try {
    console.log('🚀 Starting migration: Add Course Enhancement Fields');
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get all existing courses
    const courses = await EducationalCourse.find({});
    console.log(`📚 Found ${courses.length} courses to migrate`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const course of courses) {
      try {
        // Check if course already has enhancement fields
        if (course.price && course.stats && course.settings) {
          console.log(`⏭️  Skipping course "${course.title}" - already migrated`);
          skippedCount++;
          continue;
        }
        
        // Set default values for new fields
        const updates = {
          // Pricing - default to free
          price: {
            amount: 0,
            currency: 'USD',
            isFree: true
          },
          
          // Empty arrays for topics, prerequisites, learningOutcomes
          topics: [],
          prerequisites: [],
          learningOutcomes: [],
          
          // Default lesson and duration counts
          totalLessons: 0,
          totalDuration: 0,
          
          // No media by default
          thumbnail: null,
          previewVideo: null,
          
          // Empty syllabus
          syllabus: [],
          
          // Empty instructor info
          instructorInfo: {
            bio: '',
            credentials: [],
            socialLinks: {
              linkedin: '',
              twitter: '',
              website: ''
            }
          },
          
          // Initialize stats
          stats: {
            totalEnrollments: course.enrolledParticipants ? course.enrolledParticipants.length : 0,
            activeEnrollments: course.enrolledParticipants ? course.enrolledParticipants.length : 0,
            completionRate: 0,
            averageRating: 0,
            totalReviews: 0,
            previewViews: 0
          },
          
          // No badges initially
          badges: [],
          
          // Default settings
          settings: {
            allowReviews: true,
            certificateEnabled: true,
            autoEnroll: false
          },
          
          // Set publishedAt for published courses
          publishedAt: course.status === 'Published' ? (course.createdAt || new Date()) : null
        };
        
        // Update the course
        await EducationalCourse.updateOne(
          { _id: course._id },
          { $set: updates }
        );
        
        console.log(`✅ Updated course: "${course.title}"`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating course "${course.title}":`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} courses`);
    console.log(`   ⏭️  Skipped: ${skippedCount} courses`);
    console.log(`   📚 Total: ${courses.length} courses`);
    console.log('\n✨ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = migrate;
