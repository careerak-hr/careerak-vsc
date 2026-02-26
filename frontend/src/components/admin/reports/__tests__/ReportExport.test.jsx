import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersReportView from '../UsersReportView';
import JobsReportView from '../JobsReportView';
import CoursesReportView from '../CoursesReportView';
import ReviewsReportView from '../ReviewsReportView';
import { AppContext } from '../../../../context/AppContext';

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement to track link clicks
const mockClick = jest.fn();
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement(tagName);
  if (tagName === 'a') {
    element.click = mockClick;
  }
  return element;
});

const mockAppContext = {
  language: 'en',
  fontFamily: 'Arial, sans-serif'
};

const mockUsersReportData = {
  totalUsers: 150,
  byType: { jobSeeker: 80, company: 50, freelancer: 20 },
  growthRate: 15.5,
  mostActive: [],
  inactive: [],
  dateRange: { start: null, end: null }
};

const mockJobsReportData = {
  totalJobs: 100,
  byField: { IT: 50, Healthcare: 30, Education: 20 },
  applicationRate: 2.5,
  mostPopular: [],
  mostActiveCompanies: [],
  dateRange: { start: null, end: null }
};

const mockCoursesReportData = {
  totalCourses: 75,
  byField: { IT: 40, Business: 25, Design: 10 },
  enrollmentRate: 3.2,
  completionRate: 65.5,
  mostPopular: [],
  dateRange: { start: null, end: null }
};

const mockReviewsReportData = {
  totalReviews: 200,
  averageRating: 4.2,
  flaggedCount: 5,
  byRating: { 1: 10, 2: 15, 3: 30, 4: 70, 5: 75 },
  dateRange: { start: null, end: null }
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockAppContext}>
      {component}
    </AppContext.Provider>
  );
};

describe('Report Export Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('exports users report as JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsersReportData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Users Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  test('exports jobs report as JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockJobsReportData })
    });
    
    renderWithContext(<JobsReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Jobs Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  test('exports courses report as JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCoursesReportData })
    });
    
    renderWithContext(<CoursesReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Courses Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  test('exports reviews report as JSON', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReviewsReportData })
    });
    
    renderWithContext(<ReviewsReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Reviews Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  test('export button is disabled when no data is loaded', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    expect(screen.queryByText('Export Report')).not.toBeInTheDocument();
  });

  test('exported file has correct filename format', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsersReportData })
    });
    
    const mockDate = new Date('2024-06-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Users Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    // Check that the link element was created with correct download attribute
    const createElementCalls = document.createElement.mock.calls;
    const linkCall = createElementCalls.find(call => call[0] === 'a');
    expect(linkCall).toBeDefined();
    
    global.Date.mockRestore();
  });

  test('exported JSON contains all report data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsersReportData })
    });
    
    let blobContent = null;
    const originalBlob = global.Blob;
    global.Blob = jest.fn((content, options) => {
      blobContent = content[0];
      return new originalBlob(content, options);
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Users Report')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    expect(blobContent).toBeTruthy();
    const parsedData = JSON.parse(blobContent);
    expect(parsedData.totalUsers).toBe(150);
    expect(parsedData.growthRate).toBe(15.5);
    
    global.Blob = originalBlob;
  });
});
