# Task 1: Data Models and Database Schemas Setup

## Overview

This document describes the implementation of Task 1 for the Apply Page Enhancements feature. Task 1 establishes the foundational data models and database schemas required for the enhanced job application system.

## Requirements Addressed

- **Requirement 1.1**: Auto-fill application data from user profile
- **Requirement 2.3**: Draft application storage with all field values
- **Requirement 4.10**: File references preservation in drafts
- **Requirement 8.1**: Custom company questions (up to 5)
- **Requirement 11.1**: Backend database storage for drafts

## Models Created/Enhanced

### 1. ApplicationDraft Model (NEW)

**File**: `backend/src/models/ApplicationDraft.js`

**Purpose**: Store partially completed applications for later completion.

**Key Fields**:
- `jobPosting` (ObjectId, required, indexed) - Reference to job posting
- `applicant` (ObjectId, required, indexed) - Reference to user
- `step` (Number, 1-5) - Current step in multi-step form
- `formData` (Object) - All form field values
  - Personal Information (fullName, email, phone, country, city)
  - Education array (level, degree, institution, city, country, year, grade)
  - Experience array (company, position, from, to, current, tasks, workType, jobLevel, country, city)
  - Skills (computerSkills, softwareSkills, otherSkills)
  - Languages array (language, proficiency)
  - Additional (coverLetter, expectedSalary, availableFrom, noticePeriod)
- `files` (Array) - Uploaded file references
  - id, name, size, type, url, cloudinaryId, category, uploadedAt
- `customAnswers` (Array) - Answers to custom questions
  - questionId, questionText, questionType, answer
- `lastSaved` (Date) - Timestamp of last save

**Indexes**:
- Compound unique index: `{ applicant: 1, jobPosting: 1 }` - One draft per user per job
- Single index: `{ lastSaved: 1 }` - For cleanup queries

### 2. JobApplication Model (ENHANCED)

**File**: `backend/src/models/JobApplication.js`

**Changes**: Enhanced existing model with new fields for comprehensive application data.

**New Fields Added**:
- `country`, `city` - Location information
- `education` (Array) - Education history
- `experience` (Array) - Work experience history (replaces single `experience` number)
- `computerSkills`, `softwareSkills`, `otherSkills` (Arrays) - Detailed skills
- `languages` (Array) - Language proficiencies
- `files` (Array) - Multiple file uploads
- `customAnswers` (Array) - Custom question responses
- `statusHistory` (Array) - Status change tracking
  - status, timestamp, note, updatedBy
- `submittedAt`, `withdrawnAt` - Additional timestamps
- `expectedSalary`, `availableFrom`, `noticePeriod` - Additional info

**Status Enum Updated**:
- Old: `['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted']`
- New: `['Submitted', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected', 'Withdrawn']`

**Indexes Enhanced**:
- `{ applicant: 1, status: 1 }` - User's applications by status
- `{ jobPosting: 1, status: 1 }` - Job's applications by status
- `{ submittedAt: -1 }` - Time-based queries
- `{ status: 1, submittedAt: -1 }` - Combined filtering
- Legacy indexes maintained for backward compatibility

### 3. JobPosting Model (ENHANCED)

**File**: `backend/src/models/JobPosting.js`

**Changes**: Added custom questions field.

**New Field Added**:
- `customQuestions` (Array, max 5) - Company-specific questions
  - id (auto-generated ObjectId string)
  - questionText (String, required, max 500 chars)
  - questionType (Enum: 'short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no')
  - options (Array of strings) - For choice questions
  - required (Boolean, default false)
  - order (Number) - Display order

## Database Scripts

### 1. Create Indexes Script

**File**: `backend/scripts/create-application-indexes.js`

**Purpose**: Create all necessary indexes for optimal query performance.

**Usage**:
```bash
cd backend
npm run db:create-indexes
```

**What it does**:
1. Connects to MongoDB
2. Creates indexes for ApplicationDraft
3. Creates indexes for JobApplication
4. Creates indexes for JobPosting
5. Verifies critical indexes exist
6. Displays statistics

**Expected Output**:
```
✅ Connected to MongoDB

📋 Creating ApplicationDraft indexes...
✅ ApplicationDraft indexes created:
   - _id_
   - applicant_1_jobPosting_1
   - lastSaved_1

📋 Creating JobApplication indexes...
✅ JobApplication indexes created:
   - _id_
   - jobPosting_1_applicant_1
   - submittedAt_-1
   - applicant_1_status_1
   - jobPosting_1_status_1
   - status_1_submittedAt_-1

✅ All critical indexes verified successfully!
```

### 2. Validate Models Script

**File**: `backend/scripts/validate-application-models.js`

**Purpose**: Validate that all required fields and indexes are properly configured.

**Usage**:
```bash
cd backend
npm run db:validate-models
```

**What it does**:
1. Validates ApplicationDraft schema fields
2. Validates JobApplication schema fields
3. Validates JobPosting schema fields
4. Connects to MongoDB and validates indexes
5. Provides comprehensive validation report

**Expected Output**:
```
📋 Validating ApplicationDraft schema...
   ✅ jobPosting exists
   ✅ applicant exists
   ✅ step exists
   ✅ formData exists
   ✅ files exists
   ✅ customAnswers exists
   ✅ lastSaved exists

============================================================
VALIDATION SUMMARY
============================================================
✅ All models and indexes are properly configured!

✅ Ready for Task 1 completion!
============================================================
```

## Installation & Setup

### Step 1: Install Dependencies

No new dependencies required. All models use existing Mongoose.

### Step 2: Create Indexes

```bash
cd backend
npm run db:create-indexes
```

This creates all necessary indexes in your MongoDB database.

### Step 3: Validate Setup

```bash
npm run db:validate-models
```

This verifies that all models and indexes are correctly configured.

## Testing

### Manual Testing

**Test ApplicationDraft Creation**:
```javascript
const ApplicationDraft = require('./src/models/ApplicationDraft');

const draft = new ApplicationDraft({
  jobPosting: '507f1f77bcf86cd799439011',
  applicant: '507f1f77bcf86cd799439012',
  step: 2,
  formData: {
    fullName: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+201234567890',
    education: [{
      level: 'Bachelor',
      degree: 'Computer Science',
      institution: 'Cairo University',
      year: '2020'
    }]
  },
  files: [],
  customAnswers: []
});

await draft.save();
console.log('Draft saved:', draft._id);
```

**Test JobApplication Enhancement**:
```javascript
const JobApplication = require('./src/models/JobApplication');

const application = new JobApplication({
  jobPosting: '507f1f77bcf86cd799439011',
  applicant: '507f1f77bcf86cd799439012',
  fullName: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+201234567890',
  education: [{
    level: 'Bachelor',
    degree: 'Computer Science',
    institution: 'Cairo University',
    year: '2020'
  }],
  experience: [{
    company: 'Tech Corp',
    position: 'Software Engineer',
    from: new Date('2020-01-01'),
    to: new Date('2023-01-01'),
    current: false
  }],
  computerSkills: [
    { skill: 'JavaScript', proficiency: 'Advanced' },
    { skill: 'React', proficiency: 'Intermediate' }
  ],
  languages: [
    { language: 'Arabic', proficiency: 'Native' },
    { language: 'English', proficiency: 'Fluent' }
  ],
  status: 'Submitted',
  statusHistory: [{
    status: 'Submitted',
    timestamp: new Date()
  }]
});

await application.save();
console.log('Application saved:', application._id);
```

**Test JobPosting Custom Questions**:
```javascript
const JobPosting = require('./src/models/JobPosting');

const job = await JobPosting.findById('507f1f77bcf86cd799439011');
job.customQuestions = [
  {
    questionText: 'Why do you want to work for our company?',
    questionType: 'long_text',
    required: true,
    order: 1
  },
  {
    questionText: 'What is your expected salary range?',
    questionType: 'single_choice',
    options: ['$50k-$70k', '$70k-$90k', '$90k+'],
    required: true,
    order: 2
  }
];

await job.save();
console.log('Custom questions added');
```

## Performance Considerations

### Index Strategy

1. **ApplicationDraft**:
   - Compound unique index on `(applicant, jobPosting)` ensures one draft per user per job
   - Single index on `lastSaved` enables efficient cleanup of old drafts

2. **JobApplication**:
   - Compound indexes on `(applicant, status)` and `(jobPosting, status)` optimize filtering
   - Index on `submittedAt` enables time-based queries
   - Unique compound index on `(jobPosting, applicant)` prevents duplicate applications

3. **JobPosting**:
   - Existing indexes maintained
   - No additional indexes needed for `customQuestions` (small array, infrequent queries)

### Query Optimization

**Efficient Queries**:
```javascript
// Get user's draft for a job (uses compound index)
const draft = await ApplicationDraft.findOne({ 
  applicant: userId, 
  jobPosting: jobId 
});

// Get user's applications by status (uses compound index)
const applications = await JobApplication.find({ 
  applicant: userId, 
  status: 'Submitted' 
}).sort({ submittedAt: -1 });

// Get job's applications (uses compound index)
const applications = await JobApplication.find({ 
  jobPosting: jobId, 
  status: { $in: ['Submitted', 'Reviewed'] }
});
```

## Migration from Old Schema

### Backward Compatibility

The enhanced JobApplication model maintains backward compatibility:

**Legacy Fields Preserved**:
- `resume` (String) - Old single resume field
- `qualifications` (Array) - Old qualifications array
- `appliedAt` (Date) - Old timestamp field
- `reviewedBy` (ObjectId) - Old reviewer reference

**Migration Strategy**:
1. New applications use enhanced fields
2. Old applications continue to work with legacy fields
3. Gradual migration can be done via background job if needed

### Data Migration Script (Optional)

If you need to migrate old applications to new format:

```javascript
// backend/scripts/migrate-old-applications.js
const JobApplication = require('../src/models/JobApplication');

async function migrateApplications() {
  const oldApps = await JobApplication.find({ 
    education: { $exists: false } 
  });

  for (const app of oldApps) {
    // Map old experience number to experience array
    if (app.experience && typeof app.experience === 'number') {
      app.experience = [{
        company: 'Previous Company',
        position: 'Previous Position',
        from: new Date(Date.now() - app.experience * 365 * 24 * 60 * 60 * 1000),
        to: new Date(),
        current: false
      }];
    }

    // Initialize new arrays
    app.education = app.education || [];
    app.computerSkills = app.computerSkills || [];
    app.languages = app.languages || [];
    app.files = app.files || [];
    app.customAnswers = app.customAnswers || [];
    app.statusHistory = app.statusHistory || [{
      status: app.status,
      timestamp: app.appliedAt || new Date()
    }];

    await app.save();
  }

  console.log(`Migrated ${oldApps.length} applications`);
}
```

## Troubleshooting

### Issue: Indexes not created

**Solution**:
```bash
# Drop existing indexes and recreate
mongo
> use your_database_name
> db.applicationdrafts.dropIndexes()
> db.jobapplications.dropIndexes()
> exit

# Recreate indexes
npm run db:create-indexes
```

### Issue: Validation errors

**Solution**:
```bash
# Check model validation
npm run db:validate-models

# If fields are missing, ensure you're using the latest model files
git pull origin main
```

### Issue: Duplicate key error

**Solution**:
```javascript
// This means a draft already exists for this user+job combination
// Either update the existing draft or delete it first
await ApplicationDraft.findOneAndUpdate(
  { applicant: userId, jobPosting: jobId },
  { $set: { step: 2, formData: newData } },
  { upsert: true, new: true }
);
```

## Next Steps

After completing Task 1, you can proceed to:

- **Task 2**: Implement backend draft management API
- **Task 3**: Implement backend application submission API
- **Task 4**: Integrate Cloudinary file upload service

## References

- Design Document: `.kiro/specs/apply-page-enhancements/design.md`
- Requirements Document: `.kiro/specs/apply-page-enhancements/requirements.md`
- Tasks Document: `.kiro/specs/apply-page-enhancements/tasks.md`

## Completion Checklist

- [x] ApplicationDraft model created with all required fields
- [x] JobApplication model enhanced with new fields
- [x] JobPosting model enhanced with customQuestions
- [x] Database indexes created for efficient queries
- [x] Index creation script implemented
- [x] Model validation script implemented
- [x] Package.json scripts added
- [x] Documentation completed
- [ ] Indexes created in database (run `npm run db:create-indexes`)
- [ ] Models validated (run `npm run db:validate-models`)

---

**Task 1 Status**: ✅ Implementation Complete - Ready for Testing
