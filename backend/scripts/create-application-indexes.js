/**
 * Database Migration Script: Create Indexes for Apply Page Enhancements
 * 
 * This script creates all necessary indexes for the enhanced application system:
 * - ApplicationDraft indexes
 * - Enhanced JobApplication indexes
 * - JobPosting indexes for custom questions
 * 
 * Run this script after deploying the new models to ensure optimal query performance.
 * 
 * Usage: node scripts/create-application-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobApplication = require('../src/models/JobApplication');
const JobPosting = require('../src/models/JobPosting');

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create ApplicationDraft indexes
    console.log('📋 Creating ApplicationDraft indexes...');
    await ApplicationDraft.createIndexes();
    const draftIndexes = await ApplicationDraft.collection.getIndexes();
    console.log('✅ ApplicationDraft indexes created:');
    Object.keys(draftIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });
    console.log('');

    // Create JobApplication indexes
    console.log('📋 Creating JobApplication indexes...');
    await JobApplication.createIndexes();
    const applicationIndexes = await JobApplication.collection.getIndexes();
    console.log('✅ JobApplication indexes created:');
    Object.keys(applicationIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });
    console.log('');

    // Create JobPosting indexes (if not already created)
    console.log('📋 Creating JobPosting indexes...');
    await JobPosting.createIndexes();
    const postingIndexes = await JobPosting.collection.getIndexes();
    console.log('✅ JobPosting indexes created:');
    Object.keys(postingIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });
    console.log('');

    // Verify critical indexes
    console.log('🔍 Verifying critical indexes...');
    
    const criticalIndexes = [
      { model: 'ApplicationDraft', index: 'applicant_1_jobPosting_1' },
      { model: 'JobApplication', index: 'jobPosting_1_applicant_1' },
      { model: 'JobApplication', index: 'submittedAt_-1' },
      { model: 'JobApplication', index: 'applicant_1_status_1' }
    ];

    let allIndexesExist = true;
    for (const { model, index } of criticalIndexes) {
      let indexes;
      if (model === 'ApplicationDraft') indexes = draftIndexes;
      else if (model === 'JobApplication') indexes = applicationIndexes;
      else if (model === 'JobPosting') indexes = postingIndexes;

      if (indexes[index]) {
        console.log(`   ✅ ${model}.${index} exists`);
      } else {
        console.log(`   ❌ ${model}.${index} MISSING`);
        allIndexesExist = false;
      }
    }

    console.log('');
    if (allIndexesExist) {
      console.log('✅ All critical indexes verified successfully!');
    } else {
      console.log('⚠️  Some critical indexes are missing. Please check the logs above.');
    }

    console.log('\n📊 Index Statistics:');
    console.log(`   ApplicationDraft: ${Object.keys(draftIndexes).length} indexes`);
    console.log(`   JobApplication: ${Object.keys(applicationIndexes).length} indexes`);
    console.log(`   JobPosting: ${Object.keys(postingIndexes).length} indexes`);

    console.log('\n✅ Index creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
createIndexes();
