# Cron Jobs Setup - Settings Page Enhancements

## Overview

This document describes the cron jobs setup for the Settings Page Enhancements feature. These jobs handle background tasks like session cleanup, data export cleanup, account deletions, and notification delivery.

**Requirements**: 7.5, 9.6, 11.5, 12.7, 12.8

## Available Jobs

### 1. Cleanup Expired Sessions
- **Job Name**: `cleanupExpiredSessions`
- **Schedule**: Daily at 2:00 AM UTC
- **Requirement**: 9.6
- **Description**: Cleans up expired sessions and sessions inactive for more than 30 days
- **What it does**:
  - Deletes sessions where `expiresAt < now`
  - Deletes sessions where `lastActivity < 30 days ago`

### 2. Cleanup Expired Exports
- **Job Name**: `cleanupExpiredExports`
- **Schedule**: Daily at 3:00 AM UTC
- **Requirement**: 11.5
- **Description**: Cleans up expired data export files (7 days after completion)
- **What it does**:
  - Finds export requests where `expiresAt < now`
  - Deletes the export file from disk
  - Deletes the export request from database

### 3. Process Scheduled Deletions
- **Job Name**: `processScheduledDeletions`
- **Schedule**: Daily at 4:00 AM UTC
- **Requirement**: 12.5, 12.8
- **Description**: Processes scheduled account deletions after grace period (30 days)
- **What it does**:
  - Finds deletion requests where `scheduledDate <= now`
  - Permanently deletes all user data
  - Anonymizes data that must be retained for legal reasons
  - Sends final confirmation email

### 4. Send Deletion Reminders
- **Job Name**: `sendDeletionReminders`
- **Schedule**: Daily at 10:00 AM UTC
- **Requirement**: 12.7
- **Description**: Sends reminders 7 days before scheduled account deletion
- **What it does**:
  - Finds deletion requests where `scheduledDate - 7 days <= now`
  - Sends reminder notification to user
  - Marks reminder as sent

### 5. Send Queued Notifications
- **Job Name**: `sendQueuedNotifications`
- **Schedule**: Every hour (0 * * * *)
- **Requirement**: 7.5
- **Description**: Sends notifications that were queued during quiet hours
- **What it does**:
  - Finds queued notifications where `scheduledFor <= now`
  - Sends each notification
  - Deletes from queue after successful delivery
  - Retries up to 3 times on failure

## Setup

### Automatic Startup

The cron scheduler starts automatically when the server starts:

```javascript
// In server.js
const cronScheduler = require('./src/jobs/cronScheduler');
cronScheduler.start();
```

### Manual Control

You can control the scheduler programmatically:

```javascript
const cronScheduler = require('./src/jobs/cronScheduler');

// Start scheduler
cronScheduler.start();

// Stop scheduler
cronScheduler.stop();

// Get status
const status = cronScheduler.getStatus();
console.log(status);
// {
//   isRunning: true,
//   jobs: [
//     { name: 'cleanupExpiredSessions', running: true },
//     { name: 'cleanupExpiredExports', running: true },
//     ...
//   ]
// }

// Run a job manually
const result = await cronScheduler.runJobManually('cleanupExpiredSessions');
console.log(result);
// {
//   success: true,
//   expiredCount: 5,
//   inactiveCount: 3,
//   message: 'Cleaned up 5 expired and 3 inactive sessions'
// }
```

## CLI Usage

### List Available Jobs

```bash
npm run cron:list
```

Output:
```
📋 Available Cron Jobs:

1. cleanupExpiredSessions
   Description: Cleanup expired and inactive sessions
   Schedule: Daily at 2:00 AM UTC
   Requirement: 9.6

2. cleanupExpiredExports
   Description: Cleanup expired data export files
   Schedule: Daily at 3:00 AM UTC
   Requirement: 11.5

...
```

### Run a Specific Job

```bash
# Cleanup expired sessions
npm run cron:sessions

# Cleanup expired exports
npm run cron:exports

# Process scheduled deletions
npm run cron:deletions

# Send deletion reminders
npm run cron:reminders

# Send queued notifications
npm run cron:notifications
```

### Run All Jobs

```bash
npm run cron:all
```

## API Endpoints (Admin Only)

### Get Cron Status

```http
GET /api/cron/status
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "jobs": [
      { "name": "cleanupExpiredSessions", "running": true },
      { "name": "cleanupExpiredExports", "running": true },
      { "name": "processScheduledDeletions", "running": true },
      { "name": "sendDeletionReminders", "running": true },
      { "name": "sendQueuedNotifications", "running": true }
    ]
  }
}
```

### Get Available Jobs

```http
GET /api/cron/jobs
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "cleanupExpiredSessions",
      "description": "Cleanup expired and inactive sessions",
      "schedule": "Daily at 2:00 AM UTC",
      "requirement": "9.6"
    },
    ...
  ]
}
```

### Run a Job Manually

```http
POST /api/cron/run/:jobName
Authorization: Bearer <admin_token>
```

Example:
```bash
curl -X POST http://localhost:5000/api/cron/run/cleanupExpiredSessions \
  -H "Authorization: Bearer <admin_token>"
```

Response:
```json
{
  "success": true,
  "message": "Cleaned up 5 expired and 3 inactive sessions",
  "data": {
    "success": true,
    "expiredCount": 5,
    "inactiveCount": 3
  }
}
```

### Start Scheduler

```http
POST /api/cron/start
Authorization: Bearer <admin_token>
```

### Stop Scheduler

```http
POST /api/cron/stop
Authorization: Bearer <admin_token>
```

## Monitoring

### Logs

All cron jobs log their execution:

```
[2026-03-07 02:00:00] INFO: Running cleanupExpiredSessions job...
[2026-03-07 02:00:01] INFO: Cleaned up 5 expired sessions and 3 inactive sessions
```

### Error Handling

If a job fails, the error is logged but doesn't stop other jobs:

```
[2026-03-07 03:00:00] INFO: Running cleanupExpiredExports job...
[2026-03-07 03:00:01] ERROR: Error in cleanupExpiredExports job: Database connection failed
```

### Manual Monitoring

Check job status via API or CLI:

```bash
# Via CLI
npm run cron:list

# Via API
curl http://localhost:5000/api/cron/status \
  -H "Authorization: Bearer <admin_token>"
```

## Production Deployment

### PM2 Configuration

Add cron scheduler to PM2 ecosystem:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'careerak-backend',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

The cron scheduler will start automatically with the server.

### Vercel Deployment

⚠️ **Important**: Vercel serverless functions have a 10-second timeout. Cron jobs won't work on Vercel.

**Solutions**:
1. Use Vercel Cron Jobs (Beta)
2. Use external cron service (e.g., cron-job.org)
3. Use separate server for cron jobs

### External Cron Service

If using external cron service, call the API endpoints:

```bash
# cron-job.org configuration
0 2 * * * curl -X POST https://api.careerak.com/api/cron/run/cleanupExpiredSessions -H "Authorization: Bearer <token>"
0 3 * * * curl -X POST https://api.careerak.com/api/cron/run/cleanupExpiredExports -H "Authorization: Bearer <token>"
0 4 * * * curl -X POST https://api.careerak.com/api/cron/run/processScheduledDeletions -H "Authorization: Bearer <token>"
0 10 * * * curl -X POST https://api.careerak.com/api/cron/run/sendDeletionReminders -H "Authorization: Bearer <token>"
0 * * * * curl -X POST https://api.careerak.com/api/cron/run/sendQueuedNotifications -H "Authorization: Bearer <token>"
```

## Testing

### Unit Tests

```bash
npm test -- cronScheduler.test.js
```

Tests cover:
- Starting/stopping scheduler
- Getting status
- Running jobs manually
- Error handling

### Manual Testing

```bash
# Test a specific job
npm run cron:sessions

# Test all jobs
npm run cron:all
```

## Troubleshooting

### Jobs Not Running

1. Check if scheduler is running:
```bash
npm run cron:list
```

2. Check logs for errors:
```bash
tail -f backend/logs/combined.log
```

3. Restart scheduler:
```javascript
cronScheduler.stop();
cronScheduler.start();
```

### Job Execution Errors

1. Run job manually to see error:
```bash
npm run cron:sessions
```

2. Check database connection:
```bash
node -e "require('./src/config/database')().then(() => console.log('OK'))"
```

3. Check service dependencies:
```javascript
const sessionService = require('./src/services/sessionService');
await sessionService.cleanupExpiredSessions();
```

## Best Practices

1. **Monitor Logs**: Regularly check logs for errors
2. **Test Manually**: Test jobs manually before deploying
3. **Backup Data**: Backup database before running deletion jobs
4. **Gradual Rollout**: Test in staging before production
5. **Alert on Failures**: Set up alerts for job failures
6. **Document Changes**: Update this document when adding new jobs

## Related Files

- `backend/src/jobs/cronScheduler.js` - Main scheduler
- `backend/src/controllers/cronController.js` - API controller
- `backend/src/routes/cronRoutes.js` - API routes
- `backend/scripts/run-cron-job.js` - CLI script
- `backend/src/tests/cronScheduler.test.js` - Unit tests

## Support

For issues or questions:
- Check logs: `backend/logs/combined.log`
- Run tests: `npm test -- cronScheduler.test.js`
- Contact: careerak.hr@gmail.com
