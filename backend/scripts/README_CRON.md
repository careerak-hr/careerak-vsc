# Cron Job Scripts

## run-cron-job.js

Manual cron job runner for testing and maintenance.

### Usage

```bash
# Show help
node scripts/run-cron-job.js --help

# List available jobs
node scripts/run-cron-job.js --list

# Run a specific job
node scripts/run-cron-job.js <jobName>

# Run all jobs
node scripts/run-cron-job.js --all
```

### Available Jobs

1. **cleanupExpiredSessions** - Cleanup expired and inactive sessions
2. **cleanupExpiredExports** - Cleanup expired data export files
3. **processScheduledDeletions** - Process scheduled account deletions
4. **sendDeletionReminders** - Send deletion reminders (7 days before)
5. **sendQueuedNotifications** - Send queued notifications (quiet hours)

### Examples

```bash
# Cleanup expired sessions
node scripts/run-cron-job.js cleanupExpiredSessions

# Cleanup expired exports
node scripts/run-cron-job.js cleanupExpiredExports

# Process scheduled deletions
node scripts/run-cron-job.js processScheduledDeletions

# Send deletion reminders
node scripts/run-cron-job.js sendDeletionReminders

# Send queued notifications
node scripts/run-cron-job.js sendQueuedNotifications

# Run all jobs
node scripts/run-cron-job.js --all
```

### NPM Scripts

For convenience, use npm scripts:

```bash
npm run cron:list           # List all jobs
npm run cron:all            # Run all jobs
npm run cron:sessions       # Cleanup sessions
npm run cron:exports        # Cleanup exports
npm run cron:deletions      # Process deletions
npm run cron:reminders      # Send reminders
npm run cron:notifications  # Send notifications
```

### Output

```
╔════════════════════════════════════════════════════════════╗
║              Manual Cron Job Runner                        ║
╚════════════════════════════════════════════════════════════╝

🔌 Connecting to database...
✅ Connected to database

🚀 Running job: cleanupExpiredSessions

✅ Cleaned up 5 expired and 3 inactive sessions

Details:
{
  "success": true,
  "expiredCount": 5,
  "inactiveCount": 3,
  "message": "Cleaned up 5 expired and 3 inactive sessions"
}
```

### Requirements

- Node.js 14+
- MongoDB connection
- Environment variables configured

### Related Documentation

- `backend/docs/CRON_JOBS_SETUP.md` - Full setup guide
- `backend/docs/CRON_JOBS_QUICK_START.md` - Quick start guide
- `backend/src/jobs/cronScheduler.js` - Scheduler implementation
