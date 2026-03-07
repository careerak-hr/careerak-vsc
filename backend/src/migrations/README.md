# Database Migrations

This directory contains database migration scripts for the Careerak backend.

## Available Migrations

### 001_add_course_enhancements.js

**Purpose**: Adds enhancement fields to existing EducationalCourse documents.

**What it does**:
- Adds default values for new enhancement fields (price, topics, prerequisites, etc.)
- Initializes stats based on existing enrolledParticipants
- Sets up default settings for all courses
- Sets publishedAt date for published courses

**How to run**:

```bash
# From the backend directory
node src/migrations/001_add_course_enhancements.js
```

**Prerequisites**:
- MongoDB connection string in `.env` file (`MONGODB_URI`)
- Backup your database before running migrations

**What to expect**:
- The script will connect to MongoDB
- It will find all existing courses
- For each course without enhancement fields, it will add default values
- It will skip courses that already have enhancement fields
- It will display a summary of updated and skipped courses

**Example output**:
```
🚀 Starting migration: Add Course Enhancement Fields
📡 Connecting to MongoDB...
✅ Connected to MongoDB
📚 Found 15 courses to migrate
✅ Updated course: "Introduction to JavaScript"
✅ Updated course: "Advanced React Patterns"
⏭️  Skipping course "Node.js Masterclass" - already migrated
...
📊 Migration Summary:
   ✅ Updated: 12 courses
   ⏭️  Skipped: 3 courses
   📚 Total: 15 courses
✨ Migration completed successfully!
👋 Database connection closed
```

**Rollback**:
If you need to rollback this migration, you can remove the enhancement fields manually:

```javascript
// In MongoDB shell or using a script
db.educationalcourses.updateMany(
  {},
  {
    $unset: {
      price: "",
      topics: "",
      prerequisites: "",
      learningOutcomes: "",
      totalLessons: "",
      totalDuration: "",
      thumbnail: "",
      previewVideo: "",
      syllabus: "",
      instructorInfo: "",
      stats: "",
      badges: "",
      settings: "",
      publishedAt: ""
    }
  }
);
```

## Best Practices

1. **Always backup your database** before running migrations
2. **Test migrations** on a development/staging environment first
3. **Run migrations during low-traffic periods** to minimize impact
4. **Monitor the migration** output for any errors
5. **Verify the results** after migration completes

## Creating New Migrations

When creating a new migration:

1. Name it with a sequential number: `00X_description.js`
2. Include clear documentation in the file header
3. Add error handling for all operations
4. Provide a summary of changes at the end
5. Make it idempotent (safe to run multiple times)
6. Update this README with the new migration details

## Migration Checklist

Before running a migration:
- [ ] Database backup completed
- [ ] Migration tested on development environment
- [ ] `.env` file configured with correct MongoDB URI
- [ ] Low-traffic period scheduled
- [ ] Team notified of maintenance window

After running a migration:
- [ ] Migration output reviewed for errors
- [ ] Database state verified
- [ ] Application tested with new schema
- [ ] Migration documented in changelog
- [ ] Team notified of completion
