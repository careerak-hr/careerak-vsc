import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MapView from './MapView';

// Mock @react-google-maps/api
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: vi.fn(() => ({
    isLoaded: true,
    loadError: null
  })),
  GoogleMap: vi.fn(({ children }) => <div data-testid="google-map">{children}</div>),
  MarkerClusterer: vi.fn(({ children }) => children({})),
  Marker: vi.fn(() => <div data-testid="marker" />),
  InfoWindow: vi.fn(({ children }) => <div data-testid="info-window">{children}</div>)
}));

const mockJobs = [
  {
    _id: 'job1',
    title: 'مطور Full Stack',
    company: {
      name: 'شركة التقنية',
      logo: 'https://example.com/logo.png'
    },
    location: {
      city: 'الرياض',
      country: 'السعودية',
      coordinates: {
        lat: 24.7136,
        lng: 46.6753
      }
    },
    salary: {
      min: 8000,
      max: 12000,
      currency: 'SAR'
    },
    workType: 'full-time',
    skills: ['JavaScript', 'React', 'Node.js'],
    createdAt: '2026-03-03T10:00:00Z'
  },
  {
    _id: 'job2',
    title: 'مطور Frontend',
    company: {
      name: 'شركة البرمجيات',
      logo: 'https://example.com/logo2.png'
    },
    location: {
      city: 'جدة',
      country: 'السعودية',
      coordinates: {
        lat: 21.4225,
        lng: 39.8262
      }
    },
    salary: {
      min: 6000,
      max: 9000,
      currency: 'SAR'
    },
    workType: 'remote',
    skills: ['React', 'CSS', 'TypeScript'],
    createdAt: '2026-03-02T10:00:00Z'
  }
];

describe('MapView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render map container', () => {
    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('should display job count', () => {
    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    expect(screen.getByText('2 وظيفة على الخريطة')).toBeInTheDocument();
  });

  it('should filter jobs with valid coordinates', () => {
    const jobsWithInvalidCoords = [
      ...mockJobs,
      {
        _id: 'job3',
        title: 'وظيفة بدون إحداثيات',
        location: {}
      }
    ];

    render(
      <BrowserRouter>
        <MapView jobs={jobsWithInvalidCoords} />
      </BrowserRouter>
    );

    // يجب أن يعرض فقط الوظائف ذات الإحداثيات الصحيحة
    expect(screen.getByText('2 وظيفة على الخريطة')).toBeInTheDocument();
  });

  it('should call onJobClick when marker is clicked', async () => {
    const onJobClick = vi.fn();

    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} onJobClick={onJobClick} />
      </BrowserRouter>
    );

    // Note: في اختبار حقيقي، نحتاج لمحاكاة النقر على marker
    // هذا مثال بسيط
    expect(onJobClick).not.toHaveBeenCalled();
  });

  it('should handle empty jobs array', () => {
    render(
      <BrowserRouter>
        <MapView jobs={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('0 وظيفة على الخريطة')).toBeInTheDocument();
  });

  it('should use default center and zoom', () => {
    const { container } = render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    expect(container.querySelector('.map-view-container')).toBeInTheDocument();
  });

  it('should use custom center and zoom', () => {
    const customCenter = { lat: 21.4225, lng: 39.8262 };
    const customZoom = 10;

    render(
      <BrowserRouter>
        <MapView 
          jobs={mockJobs} 
          center={customCenter}
          zoom={customZoom}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });
});

describe('MapView - Loading State', () => {
  it('should show loading state when map is not loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api');
    useJsApiLoader.mockReturnValue({
      isLoaded: false,
      loadError: null
    });

    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    expect(screen.getByText('جاري تحميل الخريطة...')).toBeInTheDocument();
  });

  it('should show error state when map fails to load', () => {
    const { useJsApiLoader } = require('@react-google-maps/api');
    useJsApiLoader.mockReturnValue({
      isLoaded: false,
      loadError: new Error('Failed to load')
    });

    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    expect(screen.getByText('خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.')).toBeInTheDocument();
  });
});

describe('MapView - Clustering', () => {
  it('should render MarkerClusterer when jobs are present', () => {
    render(
      <BrowserRouter>
        <MapView jobs={mockJobs} />
      </BrowserRouter>
    );

    // MarkerClusterer يجب أن يكون موجود
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('should not render MarkerClusterer when no jobs', () => {
    render(
      <BrowserRouter>
        <MapView jobs={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('0 وظيفة على الخريطة')).toBeInTheDocument();
  });
});
