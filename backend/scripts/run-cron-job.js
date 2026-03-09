#!/usr/bin/env node

/**
 * Manual Cron Job Runner
 * Allows running cron jobs manually for testing or maintenance
 * 
 * Usage:
 *   node scripts/run-cron-job.js <jobName>
 *   node scripts/run-cron-job.js cleanupExpiredSessions
 *   node scripts/run-cron-job.js --list
 */

require('dotenv').config();
const connectDB = require('../src/config/database');
const cronScheduler = require('../src/jobs/cronScheduler');

const AVAILABLE_JOBS = [
  'cleanupExpiredSessions',
  'cleanupExpiredExports',
  'processScheduledDeletions',
  'sendDeletionReminders',
  'sendQueuedNotifications'
];

async function main() {
  const args = process.argv.slice(2);
  
  // Show help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║              Manual Cron Job Runner                        ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node scripts/run-cron-job.js <jobName>
  node scripts/run-cron-job.js --list
  node scripts/run-cron-job.js --all

Available Jobs:
  - cleanupExpiredSessions      Cleanup expired and inactive sessions
  - cleanupExpiredExports       Cleanup expired data export files
  - processScheduledDeletions   Process scheduled account deletions
  - sendDeletionReminders       Send deletion reminders (7 days before)
  - sendQueuedNotifications     Send queued notifications (quiet hours)

Examples:
  node scripts/run-cron-job.js cleanupExpiredSessions
  node scripts/run-cron-job.js --list
  node scripts/run-cron-job.js --all
    `);
    process.exit(0);
  }
  
  // List available jobs
  if (args.includes('--list') || args.includes('-l')) {
    console.log('\n📋 Available Cron Jobs:\n');
    const jobs = cronScheduler.getAvailableJobs();
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.name}`);
      console.log(`   Description: ${job.description}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   Requirement: ${job.requirement}`);
      console.log('');
    });
    process.exit(0);
  }
  
  // Connect to database
  console.log('🔌 Connecting to database...');
  await connectDB();
  console.log('✅ Connected to database\n');
  
  // Run all jobs
  if (args.includes('--all') || args.includes('-a')) {
    console.log('🚀 Running all cron jobs...\n');
    
    for (const jobName of AVAILABLE_JOBS) {
      console.log(`\n▶️  Running: ${jobName}`);
      console.log('─'.repeat(60));
      
      const result = await cronScheduler.runJobManually(jobName);
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`   Details:`, JSON.stringify(result, null, 2));
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    }
    
    console.log('\n✅ All jobs completed\n');
    process.exit(0);
  }
  
  // Run specific job
  const jobName = args[0];
  
  if (!AVAILABLE_JOBS.includes(jobName)) {
    console.error(`❌ Unknown job: ${jobName}`);
    console.log(`\nAvailable jobs: ${AVAILABLE_JOBS.join(', ')}`);
    console.log('Use --list to see details\n');
    process.exit(1);
  }
  
  console.log(`🚀 Running job: ${jobName}\n`);
  
  const result = await cronScheduler.runJobManually(jobName);
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
    console.log('\nDetails:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    process.exit(0);
  } else {
    console.error(`❌ Job failed: ${result.error}`);
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
