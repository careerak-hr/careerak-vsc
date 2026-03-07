/**
 * اختبارات شاملة لميزة تحسينات صفحة الوظائف
 * Enhanced Job Postings - Comprehensive Test Suite
 * 
 * يغطي:
 * - View Toggle (Grid/List)
 * - Bookmark System
 * - Share System
 * - Similar Jobs
 * - Salary Estimation
 * - Company Info
 * - Skeleton Loading
 * - Performance
 * - Integration
 */

const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const JobBookmark = require('../src/models/JobBookmark');
const JobShare = require('../src/models/JobShare');
const SalaryData = require('../src/models/SalaryData');
con