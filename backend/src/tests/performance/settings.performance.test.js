/**
 * Settings Page Performance Tests
 * 
 * Tests:
 * - Response time (< 200ms GET, < 500ms POST)
 * - Concurrent users (1000 users)
 * - Database query optimization
 * - Data export time (< 48 hours)
 * 
 * Requirements: 11.7
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../models/User');
const UserSettings = require('../../models/UserSettings');
const DataExportRequest = require('../../models/DataExportRequest');
const jwt = require('jsonwebtoken');

let mongoServer;
let testUser;
let authToken;

// Helper: إنشاء مستخدم وتوكن
const createUserAndToken = async (userData = {}) => {
  const user = await User.create({
    name: userData.name || 'Test User',
    email: userData.email || `test${Date.now()}@example.com`,
    password: 'Password123!',
    role: userData.role || 'employee',
    ...userData
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  return { user, token };
};

// Helper: قياس وقت الاستجابة
const measureResponseTime = async (requestFn) => {
  const startTime = Date.now();
  const response = await requestFn();
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  return { response, responseTime };
};

// Helper: إنشاء مستخدمين متعددين
const createMultipleUsers = async (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const { user, token } = await createUserAndToken({
      email: `user${i}@example.com`,
      name: `User ${i}`
    });
    users.push({ user, token });
  }
  return users;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  // إنشاء مستخدم اختبار
  const result = await createUserAndToken();
  testUser = result.user;
  authToken = result.token;
  
  // إنشاء إعدادات للمستخدم
  await UserSettings.create({
    userId: testUser._id,
    privacy: {
      profileVisibility: 'everyone',
      showEmail: true,
      showPhone: true
    },
    notifications: {
      job: { 