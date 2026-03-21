/**
 * Task 8.5 - Test metadata with social media debuggers
 *
 * Simulates what Facebook Debugger and Twitter Card Validator do:
 * crawl the share HTML pages and validate meta tags meet platform requirements.
 *
 * Requirements: 14 (Share Metadata), 6.2 (Facebook OG), 7.2 (Twitter Cards),
 *               22.2 (Share_Link testable in social media debuggers)
 */

const mongoose = require('mongoose');

jest.mock('../src/models/JobPosting');
jest.mock('../src/models/EducationalCourse');
jest.mock('../src/models/User');
jest.mock('../src/models/CompanyInfo');
jest.mock('../src/models/UserSettings');

const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const { Individual } = require('../src/models/User');
const CompanyInfo = require('../src/models/CompanyInfo');
const UserSettings = require('../src/models/UserSettings');

const { generateAllMetaTags } = require('../src/services/metadataService');
const { buildMetaHtmlForTest } = require('./helpers/metaHtmlHelper');

const FAKE_ID = new mongoose.Types.ObjectId().toString();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockJob(overrides = {}) {
  const job = {
    _id: FAKE_ID,
    title: 'Senior Backend Developer',
    description: 'We are looking for a skilled backend developer.',
    company: { name: 'Acme Corp', logo: 'https://cdn.example.com/acme-logo.png' },
    location: { type: 'Cairo, Egypt' },
    salary: { min: 5000, max: 8000 },
    ...overrides
  };
  JobPosting.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(job) });
  return job;
}

function mockCourse(overrides = {}) {
  const course = {
    _id: FAKE_ID,
    title: 'React Masterclass',
    description: 'Learn React from scratch with hands-on projects.',
    thumbnail: 'https://cdn.example.com/react-course.jpg',
    instructor: { firstName: 'Sara', lastName: 'Ali' },
    stats: { averageRating: 4.8 },
    totalDuration: 12,
    ...overrides
  };
  EducationalCourse.findById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(course) })
  });
  return course;
}

function mockProfile(overrides = {}) {
  const user = {
    _id: FAKE_ID,
    firstName: 'Ahmed',
    lastName: 'Hassan',
    specialization: 'Full Stack Developer',
    bio: 'Passionate developer with 5 years of experience.',
    profileImage: 'https://cdn.example.com/ahmed.jpg',
    ...overrides
  };
  Individual.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) });
  UserSettings.findOne = jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue({ privacy: { profileVisibility: 'everyone' } })
  });
  return user;
}

function mockCompany(overrides = {}) {
  const companyInfo = {
    _id: FAKE_ID,
    logo: 'https://cdn.example.com/company-logo.png',
    description: 'A leading tech company in the MENA region.',
    employeeCount: '51-200',
    activeJobPostings: 5,
    company: { _id: FAKE_ID, companyName: 'TechCorp', companyIndustry: 'Technology' },
    ...overrides
  };
  CompanyInfo.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(companyInfo) })
  });
  return companyInfo;
}

// Facebook Debugger requirements (https://developers.facebook.com/tools/debug/)
// Required: og:title, og:description, og:image, og:url, og:type
// Image: min 200x200px recommended, 1200x630 optimal
// Title: max 88 chars displayed
// Description: max 300 chars
const FB_REQUIRED_TAGS = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
const FB_MAX_TITLE_LEN = 88;
const FB_MAX_DESC_LEN = 300;

// Twitter Card Validator requirements (https://cards-dev.twitter.com/validator)
// Required: twitter:card, twitter:title, twitter:description, twitter:image
// Title: max 70 chars displayed
// Description: max 200 chars
const TW_REQUIRED_TAGS = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
const TW_VALID_CARD_TYPES = ['summary', 'summary_large_image', 'app', 'player'];
const TW_MAX_TITLE_LEN = 70;
const TW_MAX_DESC_LEN = 200;

afterEach(() => jest.clearAllMocks());

// ─── Facebook Debugger Simulation ────────────────────────────────────────────

describe('Facebook Debugger simulation (Req 6.2, 14)', () => {
  describe('Job posting', () => {
    test('all required OG tags are present', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      FB_REQUIRED_TAGS.forEach(tag => {
        expect(result.openGraph).toHaveProperty(tag);
        expect(result.openGraph[tag]).toBeTruthy();
      });
    });

    test('og:title fits within Facebook display limit', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:title'].length).toBeLessThanOrEqual(FB_MAX_TITLE_LEN);
    });

    test('og:description fits within Facebook display limit', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:description'].length).toBeLessThanOrEqual(FB_MAX_DESC_LEN);
    });

    test('og:image is an absolute HTTPS URL', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:image']).toMatch(/^https:\/\//);
    });

    test('og:url is an absolute HTTPS URL pointing to careerak.com', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:url']).toMatch(/^https:\/\/careerak\.com\//);
    });

    test('og:site_name is set to Careerak', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:site_name']).toBe('Careerak');
    });

    test('og:image falls back to default when company has no logo', async () => {
      mockJob({ company: { name: 'Acme' } });
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.openGraph['og:image']).toMatch(/^https:\/\/careerak\.com\/images\//);
    });
  });

  describe('Course', () => {
    test('all required OG tags are present', async () => {
      mockCourse();
      const result = await generateAllMetaTags('course', FAKE_ID);
      FB_REQUIRED_TAGS.forEach(tag => {
        expect(result.openGraph).toHaveProperty(tag);
        expect(result.openGraph[tag]).toBeTruthy();
      });
    });

    test('og:description fits within Facebook display limit', async () => {
      mockCourse();
      const result = await generateAllMetaTags('course', FAKE_ID);
      expect(result.openGraph['og:description'].length).toBeLessThanOrEqual(FB_MAX_DESC_LEN);
    });

    test('og:image is an absolute HTTPS URL', async () => {
      mockCourse();
      const result = await generateAllMetaTags('course', FAKE_ID);
      expect(result.openGraph['og:image']).toMatch(/^https:\/\//);
    });
  });

  describe('User profile', () => {
    test('all required OG tags are present for public profile', async () => {
      mockProfile();
      const result = await generateAllMetaTags('profile', FAKE_ID);
      FB_REQUIRED_TAGS.forEach(tag => {
        expect(result.openGraph).toHaveProperty(tag);
        expect(result.openGraph[tag]).toBeTruthy();
      });
    });

    test('og:type is "profile" for user profiles', async () => {
      mockProfile();
      const result = await generateAllMetaTags('profile', FAKE_ID);
      expect(result.openGraph['og:type']).toBe('profile');
    });

    test('returns null for private profile (visibility=none)', async () => {
      mockProfile();
      UserSettings.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ privacy: { profileVisibility: 'none' } })
      });
      const result = await generateAllMetaTags('profile', FAKE_ID);
      expect(result).toBeNull();
    });
  });

  describe('Company profile', () => {
    test('all required OG tags are present', async () => {
      mockCompany();
      const result = await generateAllMetaTags('company', FAKE_ID);
      FB_REQUIRED_TAGS.forEach(tag => {
        expect(result.openGraph).toHaveProperty(tag);
        expect(result.openGraph[tag]).toBeTruthy();
      });
    });

    test('og:description includes industry (Req 4.3)', async () => {
      mockCompany();
      const result = await generateAllMetaTags('company', FAKE_ID);
      expect(result.openGraph['og:description']).toContain('Technology');
    });

    test('og:description includes active job count (Req 4.5)', async () => {
      mockCompany();
      const result = await generateAllMetaTags('company', FAKE_ID);
      expect(result.openGraph['og:description']).toMatch(/5.*open position/i);
    });
  });
});

// ─── Twitter Card Validator Simulation ───────────────────────────────────────

describe('Twitter Card Validator simulation (Req 7.2, 14.3)', () => {
  describe('Job posting', () => {
    test('all required Twitter Card tags are present', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      TW_REQUIRED_TAGS.forEach(tag => {
        expect(result.twitterCard).toHaveProperty(tag);
        expect(result.twitterCard[tag]).toBeTruthy();
      });
    });

    test('twitter:card is a valid card type', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(TW_VALID_CARD_TYPES).toContain(result.twitterCard['twitter:card']);
    });

    test('jobs use summary_large_image card type', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.twitterCard['twitter:card']).toBe('summary_large_image');
    });

    test('twitter:title fits within Twitter display limit', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.twitterCard['twitter:title'].length).toBeLessThanOrEqual(TW_MAX_TITLE_LEN);
    });

    test('twitter:description fits within Twitter display limit', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.twitterCard['twitter:description'].length).toBeLessThanOrEqual(TW_MAX_DESC_LEN);
    });

    test('twitter:image is an absolute HTTPS URL', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.twitterCard['twitter:image']).toMatch(/^https:\/\//);
    });

    test('twitter:site is set to @careerak', async () => {
      mockJob();
      const result = await generateAllMetaTags('job', FAKE_ID);
      expect(result.twitterCard['twitter:site']).toBe('@careerak');
    });
  });

  describe('Course', () => {
    test('courses use summary_large_image card type', async () => {
      mockCourse();
      const result = await generateAllMetaTags('course', FAKE_ID);
      expect(result.twitterCard['twitter:card']).toBe('summary_large_image');
    });

    test('all required Twitter Card tags are present', async () => {
      mockCourse();
      const result = await generateAllMetaTags('course', FAKE_ID);
      TW_REQUIRED_TAGS.forEach(tag => {
        expect(result.twitterCard).toHaveProperty(tag);
        expect(result.twitterCard[tag]).toBeTruthy();
      });
    });
  });

  describe('User profile', () => {
    test('profiles use summary card type', async () => {
      mockProfile();
      const result = await generateAllMetaTags('profile', FAKE_ID);
      expect(result.twitterCard['twitter:card']).toBe('summary');
    });

    test('twitter:creator is set for user profiles', async () => {
      mockProfile();
      const result = await generateAllMetaTags('profile', FAKE_ID);
      expect(result.twitterCard['twitter:creator']).toBeTruthy();
    });
  });

  describe('Company profile', () => {
    test('companies use summary card type', async () => {
      mockCompany();
      const result = await generateAllMetaTags('company', FAKE_ID);
      expect(result.twitterCard['twitter:card']).toBe('summary');
    });
  });
});

// ─── HTML Output Validation (simulates crawler reading the page) ──────────────

describe('Share HTML page meta tag rendering (Req 22.2)', () => {
  test('rendered HTML contains all OG meta tags for a job', async () => {
    mockJob();
    const result = await generateAllMetaTags('job', FAKE_ID);
    const html = buildMetaHtmlForTest(result.openGraph, result.twitterCard);

    FB_REQUIRED_TAGS.forEach(tag => {
      expect(html).toContain(`property="${tag}"`);
    });
  });

  test('rendered HTML contains all Twitter Card meta tags for a job', async () => {
    mockJob();
    const result = await generateAllMetaTags('job', FAKE_ID);
    const html = buildMetaHtmlForTest(result.openGraph, result.twitterCard);

    TW_REQUIRED_TAGS.forEach(tag => {
      expect(html).toContain(`name="${tag}"`);
    });
  });

  test('rendered HTML escapes special characters in meta content', async () => {
    mockJob({ title: 'Dev & Ops "Engineer" <Senior>' });
    const result = await generateAllMetaTags('job', FAKE_ID);
    const html = buildMetaHtmlForTest(result.openGraph, result.twitterCard);

    // Raw special chars must not appear unescaped in attribute values
    expect(html).not.toContain('content="Dev & Ops');
    expect(html).not.toContain('content="Dev & Ops "Engineer"');
  });

  test('rendered HTML includes a redirect for human visitors', async () => {
    mockJob();
    const result = await generateAllMetaTags('job', FAKE_ID);
    const html = buildMetaHtmlForTest(result.openGraph, result.twitterCard);

    expect(html).toContain('window.location.replace');
  });

  test('rendered HTML has correct Content-Type charset', async () => {
    mockJob();
    const result = await generateAllMetaTags('job', FAKE_ID);
    const html = buildMetaHtmlForTest(result.openGraph, result.twitterCard);

    expect(html).toContain('charset="utf-8"');
  });
});

// ─── Platform-specific metadata validation ───────────────────────────────────

describe('Platform metadata requirements validation (Req 14)', () => {
  test('og:image URL is absolute (not relative) for all content types', async () => {
    const setups = [
      () => mockJob(),
      () => mockCourse(),
      () => mockProfile(),
      () => mockCompany()
    ];
    const types = ['job', 'course', 'profile', 'company'];

    for (let i = 0; i < types.length; i++) {
      setups[i]();
      const result = await generateAllMetaTags(types[i], FAKE_ID);
      expect(result.openGraph['og:image']).toMatch(/^https?:\/\//);
      jest.clearAllMocks();
    }
  });

  test('og:url is absolute for all content types', async () => {
    const setups = [
      () => mockJob(),
      () => mockCourse(),
      () => mockProfile(),
      () => mockCompany()
    ];
    const types = ['job', 'course', 'profile', 'company'];

    for (let i = 0; i < types.length; i++) {
      setups[i]();
      const result = await generateAllMetaTags(types[i], FAKE_ID);
      expect(result.openGraph['og:url']).toMatch(/^https:\/\/careerak\.com\//);
      jest.clearAllMocks();
    }
  });

  test('og:description does not exceed 300 chars for any content type', async () => {
    const setups = [
      () => mockJob({ description: 'A'.repeat(500) }),
      () => mockCourse({ description: 'B'.repeat(500) }),
      () => mockProfile({ bio: 'C'.repeat(500) }),
      () => mockCompany({ description: 'D'.repeat(500) })
    ];
    const types = ['job', 'course', 'profile', 'company'];

    for (let i = 0; i < types.length; i++) {
      setups[i]();
      const result = await generateAllMetaTags(types[i], FAKE_ID);
      expect(result.openGraph['og:description'].length).toBeLessThanOrEqual(FB_MAX_DESC_LEN);
      jest.clearAllMocks();
    }
  });

  test('returns null for unknown content type (graceful failure)', async () => {
    const result = await generateAllMetaTags('video', FAKE_ID);
    expect(result).toBeNull();
  });

  test('returns null when content does not exist', async () => {
    JobPosting.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const result = await generateAllMetaTags('job', FAKE_ID);
    expect(result).toBeNull();
  });
});
