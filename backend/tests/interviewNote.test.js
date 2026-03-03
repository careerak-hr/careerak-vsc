const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const InterviewNote = require('../src/models/InterviewNote');
const VideoInterview = require('../src/models/VideoInterview');
const User = require('../src/models/User');

/**
 * Interview Note Tests
 * اختبارات نظام ملاحظات وتقييم المقابلات
 * 
 * Requirements: 8.4, 8.5
 */

describe('Interview Note System', () => {
  let evaluatorToken, candidateToken;
  let evaluatorId, candidateId;
  let interviewId, noteId;

  beforeAll(async () => {
    // إنشاء مستخدمين للاختبار
    const evaluator = await User.create({
      name: 'Test Evaluator',
      email: 'evaluator@test.com',
      password: 'password123',
      role: 'company'
    });
    evaluatorId = evaluator._id;

    const candidate = await User.create({
      name: 'Test Candidate',
      email: 'candidate@test.com',
      password: 'password123',
      role: 'jobseeker'
    });
    candidateId = candidate._id;

    // تسجيل الدخول
    const evaluatorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'evaluator@test.com', password: 'password123' });
    evaluatorToken = evaluatorRes.body.token;

    const candidateRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'candidate@test.com', password: 'password123' });
    candidateToken = candidateRes.body.token;

    // إنشاء مقابلة للاختبار
    const interview = await VideoInterview.create({
      roomId: 'test-room-123',
      hostId: evaluatorId,
      participants: [
        { userId: evaluatorId, role: 'host' },
        { userId: candidateId, role: 'participant' }
      ],
      status: 'ended',
      scheduledAt: new Date(),
      startedAt: new Date(),
      endedAt: new Date()
    });
    interviewId = interview._id;
  });

  afterAll(async () => {
    await InterviewNote.deleteMany({});
    await VideoInterview.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/interview-notes', () => {
    it('should create a new interview note', async () => {
      const noteData = {
        interviewId,
        candidateId,
        overallRating: 4,
        ratings: {
          technicalSkills: 4,
          communicationSkills: 5,
          problemSolving: 4,
          experience: 3,
          culturalFit: 5
        },
        notes: {
          strengths: 'Excellent communication skills',
          weaknesses: 'Limited experience with React',
          generalNotes: 'Overall a strong candidate',
          recommendations: 'Recommend for hire'
        },
        decision: 'hire',
        priority: 'high',
        visibility: 'team',
        status: 'final'
      };

      const res = await request(app)
        .post('/api/interview-notes')
        .set('Authorization', `Bearer ${evaluatorToken}`)
        .send(noteData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.overallRating).toBe(4);
      expect(res.body.data.decision).toBe('hire');

      noteId = res.body.data._id;
    });

    it('should not create note without authentication', async () => {
      const noteData = {
        interviewId,
        candidateId,
        overallRating: 4
      };

      const res = await request(app)
        .post('/api/interview-notes')
        .send(noteData);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/interview-notes/:id', () => {
    it('should get a single note', async () => {
      const res = await request(app)
        .get(`/api/interview-notes/${noteId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(noteId.toString());
    });
  });

  describe('GET /api/interview-notes/interview/:interviewId', () => {
    it('should get all notes for an interview', async () => {
      const res = await request(app)
        .get(`/api/interview-notes/interview/${interviewId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/interview-notes/candidate/:candidateId', () => {
    it('should get all notes for a candidate', async () => {
      const res = await request(app)
        .get(`/api/interview-notes/candidate/${candidateId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.stats).toBeDefined();
    });
  });

  describe('GET /api/interview-notes/my-notes', () => {
    it('should get evaluator\'s notes', async () => {
      const res = await request(app)
        .get('/api/interview-notes/my-notes')
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/interview-notes/:id', () => {
    it('should update a note', async () => {
      const updateData = {
        overallRating: 5,
        decision: 'hire',
        priority: 'high'
      };

      const res = await request(app)
        .put(`/api/interview-notes/${noteId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overallRating).toBe(5);
    });

    it('should not update note by non-evaluator', async () => {
      const updateData = {
        overallRating: 3
      };

      const res = await request(app)
        .put(`/api/interview-notes/${noteId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/interview-notes/stats/overview', () => {
    it('should get evaluation statistics', async () => {
      const res = await request(app)
        .get('/api/interview-notes/stats/overview')
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byDecision');
      expect(res.body.data).toHaveProperty('averageRating');
    });
  });

  describe('DELETE /api/interview-notes/:id', () => {
    it('should delete a note', async () => {
      const res = await request(app)
        .delete(`/api/interview-notes/${noteId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not delete note by non-evaluator', async () => {
      // إنشاء ملاحظة جديدة للاختبار
      const noteData = {
        interviewId,
        candidateId,
        overallRating: 3
      };

      const createRes = await request(app)
        .post('/api/interview-notes')
        .set('Authorization', `Bearer ${evaluatorToken}`)
        .send(noteData);

      const newNoteId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/interview-notes/${newNoteId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(403);
    });
  });
});