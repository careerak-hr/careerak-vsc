/**
 * Unit tests for metadataService.js
 * Validates: Requirements 14 (Share Metadata)
 * Tasks: 2.1.1 - 2.1.5
 */

const mongoose = require('mongoose');

// Mock all DB models so tests run without a real MongoDB connection
jest.mock('../src/models/JobPosting');
jest.mock('../src/models/EducationalCourse');
jest.mock('../src/models/User');
jest.mock('../src/models/CompanyInfo');

const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const { Individual } = require('../src/models/User');
const CompanyInfo = require('../src/models/CompanyInfo');

const {
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateAllMetaTags
} = require('../src/services/metadataService');

const FAKE_ID = new mongoose.Types.ObjectId().toString();

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockFindById(Model, returnValue) {
  Model.findById = jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(returnValue)
  });
}

function mockFindOne(Model, returnValue) {
  Model.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(returnValue)
    })
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('metadataService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── 2.1.1 generateOpenGraphTags() for jobs ──────────────────────────────

  describe('generateOpenGraphTags - job (2.1.1)', () => {
    const job = {
      _id: FAKE_ID,
      title: 'Senior Backend Developer',
      description: 'We are looking for a skilled backend developer to join our team.',
      company: { name: 'Acme Corp', logo: 'https://cdn.example.com/acme-logo.png' },
      location: { type: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 8000 }
    };

    test('og:title includes job title and company name', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe('Senior Backend Developer - Acme Corp');
    });

    test('og:title is just the job title when no company name', async () => {
      mockFindById(JobPosting, { ...job, company: {} });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:title']).toBe('Senior Backend Developer');
    });

    test('og:description includes location', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:description']).toContain('Cairo, Egypt');
    });

    test('og:description includes salary range', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:description']).toContain('5,000');
      expect(tags['og:description']).toContain('8,000');
    });

    test('og:description includes brief job description', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:description']).toContain('skilled backend developer');
    });

    test('og:description is at most 200 characters', async () => {
      const longDesc = 'A'.repeat(300);
      mockFindById(JobPosting, { ...job, description: longDesc });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:description'].length).toBeLessThanOrEqual(200);
    });

    test('og:image uses company logo when available', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:image']).toBe('https://cdn.example.com/acme-logo.png');
    });

    test('og:image falls back to default when no company logo', async () => {
      mockFindById(JobPosting, { ...job, company: { name: 'Acme' } });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:image']).toBe('https://careerak.com/images/default-job.jpg');
    });

    test('og:url follows the /job-postings/:id format', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:url']).toBe(`https://careerak.com/job-postings/${FAKE_ID}`);
    });

    test('og:type is "website"', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:type']).toBe('website');
    });

    test('og:site_name is "Careerak"', async () => {
      mockFindById(JobPosting, job);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:site_name']).toBe('Careerak');
    });

    test('returns null when job is not found', async () => {
      mockFindById(JobPosting, null);
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags).toBeNull();
    });

    test('works without location or salary (minimal job data)', async () => {
      mockFindById(JobPosting, {
        _id: FAKE_ID,
        title: 'Developer',
        description: 'A developer role.',
        company: { name: 'Corp' }
      });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe('Developer - Corp');
      expect(tags['og:description']).toContain('A developer role.');
    });

    test('supports Arabic job content (multilingual)', async () => {
      mockFindById(JobPosting, {
        _id: FAKE_ID,
        title: 'مطور خلفية',
        description: 'نبحث عن مطور خلفية متمرس.',
        company: { name: 'شركة التقنية' },
        location: { type: 'القاهرة، مصر' },
        salary: { min: 5000, max: 8000 }
      });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:title']).toBe('مطور خلفية - شركة التقنية');
      expect(tags['og:description']).toContain('القاهرة، مصر');
    });

    test('supports French job content (multilingual)', async () => {
      mockFindById(JobPosting, {
        _id: FAKE_ID,
        title: 'Développeur Backend',
        description: 'Nous recherchons un développeur backend expérimenté.',
        company: { name: 'Tech Société' },
        location: { type: 'Paris, France' }
      });
      const tags = await generateOpenGraphTags('job', FAKE_ID);

      expect(tags['og:title']).toBe('Développeur Backend - Tech Société');
      expect(tags['og:description']).toContain('Paris, France');
    });
  });

  // ── 2.1.2 generateOpenGraphTags() for courses ───────────────────────────

  describe('generateOpenGraphTags - course (2.1.2)', () => {
    const course = {
      _id: FAKE_ID,
      title: 'React Masterclass',
      description: 'Learn React from scratch with hands-on projects.',
      thumbnail: 'https://cdn.example.com/react-course.jpg'
    };

    test('returns correct OG tags for a course', async () => {
      mockFindById(EducationalCourse, course);
      const tags = await generateOpenGraphTags('course', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe(course.title);
      expect(tags['og:description']).toBe(course.description);
      expect(tags['og:image']).toBe(course.thumbnail);
      expect(tags['og:url']).toBe(`https://careerak.com/courses/${FAKE_ID}`);
      expect(tags['og:type']).toBe('website');
      expect(tags['og:site_name']).toBe('Careerak');
    });

    test('uses default image when course has no thumbnail', async () => {
      mockFindById(EducationalCourse, { ...course, thumbnail: null });
      const tags = await generateOpenGraphTags('course', FAKE_ID);

      expect(tags['og:image']).toBe('https://careerak.com/images/default-course.jpg');
    });

    test('returns null when course is not found', async () => {
      mockFindById(EducationalCourse, null);
      const tags = await generateOpenGraphTags('course', FAKE_ID);

      expect(tags).toBeNull();
    });
  });

  // ── 2.1.3 generateOpenGraphTags() for user profiles ─────────────────────

  describe('generateOpenGraphTags - profile (2.1.3)', () => {
    const user = {
      _id: FAKE_ID,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      specialization: 'Full Stack Developer',
      bio: 'Passionate developer with 5 years of experience.',
      profileImage: 'https://cdn.example.com/ahmed.jpg'
    };

    test('returns correct OG tags for a user profile', async () => {
      mockFindById(Individual, user);
      const tags = await generateOpenGraphTags('profile', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe('Ahmed Hassan');
      expect(tags['og:description']).toBe(user.bio);
      expect(tags['og:image']).toBe(user.profileImage);
      expect(tags['og:url']).toBe(`https://careerak.com/profile/${FAKE_ID}`);
      expect(tags['og:type']).toBe('profile');
      expect(tags['og:site_name']).toBe('Careerak');
    });

    test('falls back to name+title when bio is absent', async () => {
      mockFindById(Individual, { ...user, bio: null });
      const tags = await generateOpenGraphTags('profile', FAKE_ID);

      expect(tags['og:description']).toContain('Ahmed Hassan');
    });

    test('uses default image when profile has no picture', async () => {
      mockFindById(Individual, { ...user, profileImage: null });
      const tags = await generateOpenGraphTags('profile', FAKE_ID);

      expect(tags['og:image']).toBe('https://careerak.com/images/default-profile.jpg');
    });

    test('returns null when user is not found', async () => {
      mockFindById(Individual, null);
      const tags = await generateOpenGraphTags('profile', FAKE_ID);

      expect(tags).toBeNull();
    });
  });

  // ── 2.1.4 generateOpenGraphTags() for company profiles ──────────────────

  describe('generateOpenGraphTags - company (2.1.4)', () => {
    const companyInfo = {
      _id: FAKE_ID,
      logo: 'https://cdn.example.com/company-logo.png',
      description: 'A leading tech company in the MENA region.',
      employeeCount: '51-200',
      activeJobPostings: 5,
      company: {
        _id: FAKE_ID,
        companyName: 'TechCorp',
        companyIndustry: 'Technology'
      }
    };

    test('og:title is the company name', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe('TechCorp');
    });

    test('og:description includes industry (Req 4.3)', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:description']).toContain('Technology');
    });

    test('og:description includes employee count (Req 4.3)', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:description']).toContain('51-200');
    });

    test('og:description includes active job count (Req 4.5)', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:description']).toContain('5');
      expect(tags['og:description']).toMatch(/open position/i);
    });

    test('og:description includes company description', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:description']).toContain('leading tech company');
    });

    test('og:description is at most 200 characters', async () => {
      mockFindOne(CompanyInfo, { ...companyInfo, description: 'A'.repeat(300) });
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:description'].length).toBeLessThanOrEqual(200);
    });

    test('og:image uses company logo', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:image']).toBe('https://cdn.example.com/company-logo.png');
    });

    test('og:image falls back to default when company has no logo', async () => {
      mockFindOne(CompanyInfo, { ...companyInfo, logo: null });
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:image']).toBe('https://careerak.com/images/default-company.jpg');
    });

    test('og:url follows the /companies/:id format', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:url']).toBe(`https://careerak.com/companies/${FAKE_ID}`);
    });

    test('og:type is "profile"', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:type']).toBe('profile');
    });

    test('og:site_name is "Careerak"', async () => {
      mockFindOne(CompanyInfo, companyInfo);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags['og:site_name']).toBe('Careerak');
    });

    test('works without employee count or active jobs (minimal data)', async () => {
      mockFindOne(CompanyInfo, {
        _id: FAKE_ID,
        logo: 'https://cdn.example.com/logo.png',
        activeJobPostings: 0,
        company: { companyName: 'MinimalCorp', companyIndustry: 'Finance' }
      });
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['og:title']).toBe('MinimalCorp');
      expect(tags['og:description']).toContain('Finance');
    });

    test('returns null when company is not found', async () => {
      mockFindOne(CompanyInfo, null);
      const tags = await generateOpenGraphTags('company', FAKE_ID);

      expect(tags).toBeNull();
    });
  });

  // ── 2.1.5 generateTwitterCardTags() for all content types ───────────────

  describe('generateTwitterCardTags (2.1.5)', () => {
    test('maps OG tags to Twitter card tags for a job', async () => {
      mockFindById(JobPosting, {
        title: 'DevOps Engineer',
        description: 'Join our DevOps team.',
        company: { logo: 'https://cdn.example.com/logo.png' }
      });

      const tags = await generateTwitterCardTags('job', FAKE_ID);

      expect(tags).not.toBeNull();
      expect(tags['twitter:card']).toBe('summary_large_image');
      expect(tags['twitter:title']).toBe('DevOps Engineer');
      expect(tags['twitter:description']).toBe('Join our DevOps team.');
      expect(tags['twitter:image']).toBe('https://cdn.example.com/logo.png');
      expect(tags['twitter:site']).toBe('@careerak');
    });

    test('returns null when content is not found', async () => {
      mockFindById(JobPosting, null);
      const tags = await generateTwitterCardTags('job', FAKE_ID);

      expect(tags).toBeNull();
    });

    test('generates Twitter tags for a course', async () => {
      mockFindById(EducationalCourse, {
        title: 'Python Bootcamp',
        description: 'Learn Python fast.',
        thumbnail: 'https://cdn.example.com/python.jpg'
      });

      const tags = await generateTwitterCardTags('course', FAKE_ID);

      expect(tags['twitter:card']).toBe('summary_large_image');
      expect(tags['twitter:title']).toBe('Python Bootcamp');
      expect(tags['twitter:site']).toBe('@careerak');
    });
  });

  // ── generateAllMetaTags ──────────────────────────────────────────────────

  describe('generateAllMetaTags', () => {
    test('returns both openGraph and twitterCard tags', async () => {
      mockFindById(JobPosting, {
        title: 'QA Engineer',
        description: 'Quality assurance role.',
        company: { logo: 'https://cdn.example.com/qa.png' }
      });

      const result = await generateAllMetaTags('job', FAKE_ID);

      expect(result).not.toBeNull();
      expect(result.openGraph).toBeDefined();
      expect(result.twitterCard).toBeDefined();
      expect(result.openGraph['og:title']).toBe('QA Engineer');
      expect(result.twitterCard['twitter:title']).toBe('QA Engineer');
    });

    test('returns null when content is not found', async () => {
      mockFindById(JobPosting, null);
      const result = await generateAllMetaTags('job', FAKE_ID);

      expect(result).toBeNull();
    });
  });

  // ── Unknown content type ─────────────────────────────────────────────────

  describe('unknown content type', () => {
    test('returns null for an unsupported content type', async () => {
      const tags = await generateOpenGraphTags('video', FAKE_ID);
      expect(tags).toBeNull();
    });
  });
});
