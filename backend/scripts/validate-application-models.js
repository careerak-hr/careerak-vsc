/**
 * Model Validation Script: Validate Application Models
 * 
 * This script validates that all required fields and indexes are properly configured
 * for the Apply Page Enhancements feature.
 * 
 * Usage: node scripts/validate-application-models.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobApplication = require('../src/models/JobApplication');
const JobPosting = require('../src/models/JobPosting');

function validateModelSchema(Model, expectedFields) {
  console.log(`\n📋 Validating ${Model.modelName} schema...`);
  const schema = Model.schema.obj;
  const paths = Model.schema.paths;
  
  let allFieldsPresent = true;
  
  for (const field of expectedFields) {
    if (paths[field]) {
      console.log(`   ✅ ${field} exists`);
    } else {
      console.log(`   ❌ ${field} MISSING`);
      allFieldsPresent = false;
    }
  }
  
  return allFieldsPresent;
}

async function validateModels() {
  try {
    console.log('🔍 Validating Application Models...\n');
    
    // Validate ApplicationDraft
    const draftFields = [
      'jobPosting',
      'applicant',
      'step',
      'formData',
      'files',
      'customAnswers',
      'lastSaved'
    ];
    const draftValid = validateModelSchema(ApplicationDraft, draftFields);
    
    // Validate JobApplication
    const applicationFields = [
      'jobPosting',
      'applicant',
      'fullName',
      'email',
      'phone',
      'education',
      'experience',
      'computerSkills',
      'softwareSkills',
      'otherSkills',
      'languages',
      'files',
      'customAnswers',
      'status',
      'statusHistory',
      'submittedAt'
    ];
    const applicationValid = validateModelSchema(JobApplication, applicationFields);
    
    // Validate JobPosting
    const postingFields = [
      'title',
      'description',
      'requirements',
      'customQuestions'
    ];
    const postingValid = validateModelSchema(JobPosting, postingFields);
    
    // Connect to database to validate indexes
    console.log('\n🔌 Connecting to MongoDB to validate indexes...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Validate ApplicationDraft indexes
    console.log('📋 Validating ApplicationDraft indexes...');
    const draftIndexes = await ApplicationDraft.collection.getIndexes();
    const hasDraftCompoundIndex = draftIndexes['applicant_1_jobPosting_1'] !== undefined;
    console.log(`   ${hasDraftCompoundIndex ? '✅' : '❌'} Compound index (applicant + jobPosting) ${hasDraftCompoundIndex ? 'exists' : 'MISSING'}`);
    
    // Validate JobApplication indexes
    console.log('\n📋 Validating JobApplication indexes...');
    const applicationIndexes = await JobApplication.collection.getIndexes();
    const hasApplicationCompoundIndex = applicationIndexes['jobPosting_1_applicant_1'] !== undefined;
    const hasSubmittedAtIndex = applicationIndexes['submittedAt_-1'] !== undefined;
    const hasStatusIndex = applicationIndexes['applicant_1_status_1'] !== undefined;
    
    console.log(`   ${hasApplicationCompoundIndex ? '✅' : '❌'} Compound index (jobPosting + applicant) ${hasApplicationCompoundIndex ? 'exists' : 'MISSING'}`);
    console.log(`   ${hasSubmittedAtIndex ? '✅' : '❌'} submittedAt index ${hasSubmittedAtIndex ? 'exists' : 'MISSING'}`);
    console.log(`   ${hasStatusIndex ? '✅' : '❌'} status index ${hasStatusIndex ? 'exists' : 'MISSING'}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    const allValid = draftValid && applicationValid && postingValid && 
                     hasDraftCompoundIndex && hasApplicationCompoundIndex && 
                     hasSubmittedAtIndex && hasStatusIndex;
    
    if (allValid) {
      console.log('✅ All models and indexes are properly configured!');
      console.log('\n✅ Ready for Task 1 completion!');
    } else {
      console.log('⚠️  Some validations failed. Please review the logs above.');
      console.log('\n⚠️  Run "node scripts/create-application-indexes.js" to create missing indexes.');
    }
    
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error validating models:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed\n');
    }
  }
}

// Run the script
validateModels();
