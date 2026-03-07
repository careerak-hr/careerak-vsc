/**
 * Property Test: Custom Answer Persistence
 * 
 * Feature: apply-page-enhancements
 * Property 14: Custom answer persistence
 * 
 * Validates: Requirements 8.6
 * 
 * For any custom question answer provided by an applicant, the answer should be
 * stored with the application data and correctly displayed to the employer when
 * viewing the application.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import mongoose from 'mongoose';
import JobApplication from '../../backend/src/models/JobApplication.js';
import User from '../../backend/src/models/User.js';
import JobPosting from '../../backend/src/models/JobPosting.js';

// MongoDB connection for testing
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/care