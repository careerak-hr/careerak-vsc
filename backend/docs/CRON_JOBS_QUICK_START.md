# Cron Jobs Quick Start Guide

## 5-Minute Setup

### 1. Verify Installation (30 seconds)

```bash
cd backend

# Check if node-cron is installed
npm list node-cron

# If not installed:
npm install node-cron
```

### 2. Start Server (30 seconds)

```bash
# Development (with Socket.IO)
npm run dev:socket

# Production (PM2)
npm run pm2:start
```

The cron scheduler starts automatically with the server.

### 3. Verify Jobs Are Running (1 minute)

```bash
# List all jobs
npm run cron:list
```

Expected output:
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

### 4. Test a Job Manually (2 minutes)

```bash
# Test session cleanup
npm run cron:sessions
```

Expected output:
```
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

### 5. Monitor Logs (1 minute)

```bash
# Watch logs in real-time
tail -f backend/logs/combined.log

# Or check PM2 logs
npm run pm2:logs
```

## Quick Commands

```bash
# List all jobs
npm run cron:list

# Run all jobs
npm run cron:all

# Run specific jobs
npm run cron:sessions        # Cleanup sessions
npm run cron:exports         # Cleanup exports
npm run cron:deletions       # Process deletions
npm run cron:reminders       # Send reminders
npm run cron:notifications   # Send queued notifications
```

## API Quick Test

```bash
# Get status (requires admin token)
curl http://localhost:5000/api/cron/status \
  -H "Authorization: Bearer <admin_token>"

# Run a job manually
curl -X POST http://localhost:5000/api/cron/run/cleanupExpiredSessions \
  -H "Authorization: Bearer <admin_token>"
```

## Cron Schedule Reference

| Job | Schedule | Cron Expression |
|-----|----------|-----------------|
| Cleanup Sessions | Daily 2:00 AM | `0 2 * * *` |
| Cleanup Exports | Daily 3:00 AM | `0 3 * * *` |
| Process Deletions | Daily 4:00 AM | `0 4 * * *` |
| Send Reminders | Daily 10:00 AM | `0 10 * * *` |
| Send Notifications | Every hour | `0 * * * *` |

## Troubleshooting

### Jobs Not Running?

```bash
# 1. Check if scheduler is running
npm run cron:list

# 2. Check server logs
tail -f backend/logs/combined.log

# 3. Restart server
npm run pm2:restart
```

### Job Execution Errors?

```bash
# Run job manually to see error
npm run cron:sessions

# Check database connection
node -e "require('./src/config/database')().then(() => console.log('DB OK'))"
```

## Next Steps

- Read full documentation: `backend/docs/CRON_JOBS_SETUP.md`
- Set up monitoring alerts
- Configure external cron service for production (if using Vercel)
- Review logs regularly

## Support

For issues: careerak.hr@gmail.com
