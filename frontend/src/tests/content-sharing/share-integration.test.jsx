/**
 * Task 4.7 - Test share functionality on all pages
 * 
 * Validates:
 * - Requirement 1: Share button visible on job postings
 * - Requirement 2: Share button visible on courses
 * - Requirement 3: Share button visible on user profiles
 * - Requirement 4: Share button visible on company profiles
 * - Requirement 22: Unit tests for all share methods
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock react-icons (not installed in test environment)
vi.mock('react-icons/fa', () => {
  const React = require('react');
  const icon = (name) => (props) => React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
  return {
    FaShare: icon('share'),
    FaWhatsapp: icon('whatsapp'),
    FaLinkedin: icon('linkedin'),
    FaTwitter: icon('twitter'),
    FaFacebook: icon('facebook'),
    FaLink: icon('link'),
    FaTimes: icon('times'),
    FaTelegram: icon('telegram'),
    FaEnvelope: icon('envelope'),
    FaCommentDots: icon('comment'),
  };
});

vi.mock('../../utils/shareUtils', () => ({
  createShareData: vi.fn((content, contentType) => ({
    title: content?.title || content?.name || 'Test Content',
    text: content?.title || content?.name || 'Test Content',
    url: `https://careerak.com/${contentType}s/${content?._id || 'test-id'}`,
  })),
  shareViaFacebook: vi.fn(),
  shareViaTwitter: vi.fn(),
  shareViaLinkedIn: vi.fn(),
  shareViaWhatsApp: vi.fn(),
  shareViaTelegram: vi.fn(),
  shareViaEmail: vi.fn(),
  copyShareLink: vi.fn().mockResolvedValue({ success: true, url: 'https://careerak.com/test' }),
  shouldUseNativeShare: vi.fn().mockReturnValue(false),
}));

vi.mock('../ContactSelector/ContactSelector', () => ({
  default: () => <div data-testid="contact-selector">Contact Selector</div>,
}));

vi.mock('../../components/ContactSelector/ContactSelector', () => ({
  default: () => <div data-testid="contact-selector">Contact Selector</div>,
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

// Mock window.open
global.open = vi.fn();

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const mockAppContextValue = {
  language: 'ar',
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoading: false,
  isSettingsLoading: false,
  isAppLoading: false,
  startBgMusic: vi.fn(),
};

function renderWithContext(ui, language = 'ar') {
  return render(
    <BrowserRouter>
      <AppContext.Provider value={{ ...mockAppContextValue, language }}>
        {ui}
      </AppContext.Provider>
    </BrowserRouter>
  );
}

// ─── Shared test data ─────────────────────────────────────────────────────────

const mockJob = {
  _id: 'job-001',
  id: 'job-001',
  title: 'مطور Full Stack',
  company: { name: 'شركة التقنية', logo: null },
  description: 'وصف الوظيفة',
  location: { city: 'الرياض' },
  type: 'دوام كامل',
  salary: 15000,
  createdAt: new Date().toISOString(),
  requiredSkills: ['React', 'Node.js'],
};

const mockCourse = {
  _id: 'course-001',
  id: 'course-001',
  title: 'دورة React المتقدمة',
  description: 'تعلم React من الصفر',
  level: 'Beginner',
  totalDuration: 10,
  totalLessons: 20,
  price: { amount: 0, currency: 'USD', isFree: true },
  stats: { averageRating: 4.5, totalReviews: 50, totalEnrollments: 200 },
  badges: [],
};

const mockUser = {
  _id: 'user-001',
  name: 'أحمد محمد',
  firstName: 'أحمد',
  lastName: 'محمد',
  jobTitle: 'مطور برمجيات',
};

const mockCompany = {
  _id: 'company-001',
  name: 'شركة التقنية المتقدمة',
  description: 'شركة رائدة في مجال التقنية',
  size: 'medium',
  logo: null,
  rating: { average: 4.2, count: 30 },
};

// ─── 1. ShareButton Component (standalone) ────────────────────────────────────

describe('ShareButton Component', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  it('renders share button with correct label in Arabic', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'ar');
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('renders share button with correct label in English', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'en');
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('renders share button with correct label in French', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'fr');
    expect(screen.getByRole('button', { name: /partager/i })).toBeInTheDocument();
  });

  it('opens ShareModal when button is clicked', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />);
    const btn = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(btn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not propagate click event to parent', () => {
    const parentClick = vi.fn();
    renderWithContext(
      <div onClick={parentClick}>
        <ShareButton content={mockJob} contentType="job" />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('supports legacy job prop for backward compatibility', () => {
    renderWithContext(<ShareButton job={mockJob} />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });
});

// ─── 2. ShareModal (opened from ShareButton) ─────────────────────────────────

describe('ShareModal - share options', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  function openModal(content, contentType = 'job') {
    renderWithContext(<ShareButton content={content} contentType={contentType} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
  }

  it('shows all share options after clicking share button', () => {
    openModal(mockJob, 'job');
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
    expect(screen.getByText(/واتساب/i)).toBeInTheDocument();
    expect(screen.getByText(/لينكدإن/i)).toBeInTheDocument();
    expect(screen.getByText(/تويتر/i)).toBeInTheDocument();
    expect(screen.getByText(/فيسبوك/i)).toBeInTheDocument();
    expect(screen.getByText(/تيليغرام/i)).toBeInTheDocument();
    expect(screen.getByText(/البريد الإلكتروني/i)).toBeInTheDocument();
    expect(screen.getByText(/مشاركة عبر المحادثة/i)).toBeInTheDocument();
  });

  it('closes modal when overlay is clicked', () => {
    openModal(mockJob, 'job');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('.share-modal-overlay');
    fireEvent.click(overlay);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByLabelText('إغلاق'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls copyShareLink when copy link is clicked', async () => {
    const { copyShareLink } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/نسخ الرابط/i));
    await waitFor(() => expect(copyShareLink).toHaveBeenCalledWith(mockJob, 'job'));
  });

  it('calls shareViaWhatsApp when WhatsApp is clicked', async () => {
    const { shareViaWhatsApp } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/واتساب/i));
    expect(shareViaWhatsApp).toHaveBeenCalledWith(mockJob, 'job');
  });

  it('calls shareViaLinkedIn when LinkedIn is clicked', async () => {
    const { shareViaLinkedIn } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/لينكدإن/i));
    expect(shareViaLinkedIn).toHaveBeenCalledWith(mockJob, 'job');
  });

  it('calls shareViaTwitter when Twitter is clicked', async () => {
    const { shareViaTwitter } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/تويتر/i));
    expect(shareViaTwitter).toHaveBeenCalledWith(mockJob, 'job');
  });

  it('calls shareViaFacebook when Facebook is clicked', async () => {
    const { shareViaFacebook } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/فيسبوك/i));
    expect(shareViaFacebook).toHaveBeenCalledWith(mockJob, 'job');
  });

  it('calls shareViaTelegram when Telegram is clicked', async () => {
    const { shareViaTelegram } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/تيليغرام/i));
    expect(shareViaTelegram).toHaveBeenCalledWith(mockJob, 'job');
  });

  it('calls shareViaEmail when Email is clicked', async () => {
    const { shareViaEmail } = await import('../../utils/shareUtils');
    openModal(mockJob, 'job');
    fireEvent.click(screen.getByText(/البريد الإلكتروني/i));
    expect(shareViaEmail).toHaveBeenCalledWith(mockJob, 'job');
  });
});

// ─── 3. Requirement 1: Job Postings ──────────────────────────────────────────

describe('Requirement 1 - ShareButton on JobPostingCard (JobCardGrid)', () => {
  let JobCardGrid;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/JobCard/JobCardGrid');
    JobCardGrid = mod.default;
  });

  it('renders ShareButton in JobCardGrid', () => {
    renderWithContext(<JobCardGrid job={mockJob} />);
    // ShareButton renders with aria-label "مشاركة"
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens share modal when share button is clicked in JobCardGrid', () => {
    renderWithContext(<JobCardGrid job={mockJob} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('share modal shows share options for job in JobCardGrid', () => {
    renderWithContext(<JobCardGrid job={mockJob} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
    expect(screen.getByText(/واتساب/i)).toBeInTheDocument();
    expect(screen.getByText(/لينكدإن/i)).toBeInTheDocument();
  });

  it('share button click does not navigate away (stopPropagation)', () => {
    const onClick = vi.fn();
    renderWithContext(<JobCardGrid job={mockJob} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ─── 4. Requirement 1: JobDetailPage ─────────────────────────────────────────

describe('Requirement 1 - ShareButton on JobDetailPage', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  it('ShareButton renders with job content and job contentType', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" variant="outline" size="medium" />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens modal with job share options', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" variant="outline" size="medium" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
  });
});

// ─── 5. Requirement 2: CourseCard ────────────────────────────────────────────

describe('Requirement 2 - ShareButton on CourseCard', () => {
  let CourseCard;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock LazyImage used inside CourseCard
    vi.mock('../../components/LazyImage/LazyImage', () => ({
      default: ({ alt }) => <img alt={alt} />,
    }));
    const mod = await import('../../components/Courses/CourseCard');
    CourseCard = mod.default;
  });

  it('renders ShareButton in CourseCard', () => {
    renderWithContext(<CourseCard course={mockCourse} />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens share modal when share button is clicked in CourseCard', () => {
    renderWithContext(<CourseCard course={mockCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('share modal shows course share options in CourseCard', () => {
    renderWithContext(<CourseCard course={mockCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
    expect(screen.getByText(/واتساب/i)).toBeInTheDocument();
  });

  it('share button click does not navigate to course details', () => {
    renderWithContext(<CourseCard course={mockCourse} />);
    // Click share button - should not trigger card navigation
    const shareBtn = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(shareBtn);
    // Modal should open, not navigate
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

// ─── 6. Requirement 2: CourseDetailsPage (ShareButton integration) ────────────

describe('Requirement 2 - ShareButton on CourseDetailsPage', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  it('ShareButton renders with course content and course contentType', () => {
    renderWithContext(<ShareButton content={mockCourse} contentType="course" variant="outline" size="medium" />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens modal with course share options', () => {
    renderWithContext(<ShareButton content={mockCourse} contentType="course" variant="outline" size="medium" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
  });

  it('calls shareViaWhatsApp with course contentType', async () => {
    const { shareViaWhatsApp } = await import('../../utils/shareUtils');
    renderWithContext(<ShareButton content={mockCourse} contentType="course" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/واتساب/i));
    expect(shareViaWhatsApp).toHaveBeenCalledWith(mockCourse, 'course');
  });
});

// ─── 7. Requirement 3: UserProfilePage ───────────────────────────────────────

describe('Requirement 3 - ShareButton on UserProfilePage', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  it('ShareButton renders with profile content and profile contentType', () => {
    renderWithContext(<ShareButton content={mockUser} contentType="profile" variant="outline" size="medium" />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens modal with profile share options', () => {
    renderWithContext(<ShareButton content={mockUser} contentType="profile" variant="outline" size="medium" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
  });

  it('calls shareViaLinkedIn with profile contentType', async () => {
    const { shareViaLinkedIn } = await import('../../utils/shareUtils');
    renderWithContext(<ShareButton content={mockUser} contentType="profile" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/لينكدإن/i));
    expect(shareViaLinkedIn).toHaveBeenCalledWith(mockUser, 'profile');
  });

  it('calls copyShareLink with profile contentType', async () => {
    const { copyShareLink } = await import('../../utils/shareUtils');
    renderWithContext(<ShareButton content={mockUser} contentType="profile" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/نسخ الرابط/i));
    await waitFor(() => expect(copyShareLink).toHaveBeenCalledWith(mockUser, 'profile'));
  });
});

// ─── 8. Requirement 4: CompanyProfilePage ────────────────────────────────────

describe('Requirement 4 - ShareButton on CompanyProfilePage', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  it('ShareButton renders with company content and company contentType', () => {
    renderWithContext(<ShareButton content={mockCompany} contentType="company" variant="outline" size="medium" />);
    expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
  });

  it('opens modal with company share options', () => {
    renderWithContext(<ShareButton content={mockCompany} contentType="company" variant="outline" size="medium" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
  });

  it('calls shareViaFacebook with company contentType', async () => {
    const { shareViaFacebook } = await import('../../utils/shareUtils');
    renderWithContext(<ShareButton content={mockCompany} contentType="company" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/فيسبوك/i));
    expect(shareViaFacebook).toHaveBeenCalledWith(mockCompany, 'company');
  });

  it('calls copyShareLink with company contentType', async () => {
    const { copyShareLink } = await import('../../utils/shareUtils');
    renderWithContext(<ShareButton content={mockCompany} contentType="company" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/نسخ الرابط/i));
    await waitFor(() => expect(copyShareLink).toHaveBeenCalledWith(mockCompany, 'company'));
  });
});

// ─── 9. Requirement 22: All share methods unit tests ─────────────────────────

describe('Requirement 22 - Unit tests for all share methods', () => {
  let ShareButton;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../../components/ShareButton/ShareButton');
    ShareButton = mod.default;
  });

  const contentTypes = [
    { type: 'job', content: mockJob },
    { type: 'course', content: mockCourse },
    { type: 'profile', content: mockUser },
    { type: 'company', content: mockCompany },
  ];

  contentTypes.forEach(({ type, content }) => {
    it(`renders share button for contentType="${type}"`, () => {
      renderWithContext(<ShareButton content={content} contentType={type} />);
      expect(screen.getByRole('button', { name: /مشاركة/i })).toBeInTheDocument();
    });

    it(`opens modal for contentType="${type}"`, () => {
      renderWithContext(<ShareButton content={content} contentType={type} />);
      fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows "تم النسخ!" after successful copy', async () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/نسخ الرابط/i));
    await waitFor(() => {
      expect(screen.getByText(/تم النسخ!/i)).toBeInTheDocument();
    });
  });

  it('shows clipboard fallback input when copy fails', async () => {
    const { copyShareLink } = await import('../../utils/shareUtils');
    copyShareLink.mockResolvedValueOnce({ success: false, url: 'https://careerak.com/fallback' });

    renderWithContext(<ShareButton content={mockJob} contentType="job" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/نسخ الرابط/i));

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://careerak.com/fallback')).toBeInTheDocument();
    });
  });

  it('shows ContactSelector when chat option is clicked', () => {
    renderWithContext(<ShareButton content={mockJob} contentType="job" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    fireEvent.click(screen.getByText(/مشاركة عبر المحادثة/i));
    expect(screen.getByTestId('contact-selector')).toBeInTheDocument();
  });

  it('modal does not render when content is null', () => {
    renderWithContext(<ShareButton content={null} contentType="job" />);
    fireEvent.click(screen.getByRole('button', { name: /مشاركة/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
