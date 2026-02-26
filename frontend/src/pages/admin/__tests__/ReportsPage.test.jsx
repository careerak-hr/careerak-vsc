import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsPage from '../ReportsPage';
import { AppContext } from '../../../context/AppContext';

// Mock the report view components
jest.mock('../../../components/admin/reports/UsersReportView', () => {
  return function MockUsersReportView({ dateRange }) {
    return <div data-testid="users-report-view">Users Report: {dateRange.startDate} - {dateRange.endDate}</div>;
  };
});

jest.mock('../../../components/admin/reports/JobsReportView', () => {
  return function MockJobsReportView({ dateRange }) {
    return <div data-testid="jobs-report-view">Jobs Report: {dateRange.startDate} - {dateRange.endDate}</div>;
  };
});

jest.mock('../../../components/admin/reports/CoursesReportView', () => {
  return function MockCoursesReportView({ dateRange }) {
    return <div data-testid="courses-report-view">Courses Report: {dateRange.startDate} - {dateRange.endDate}</div>;
  };
});

jest.mock('../../../components/admin/reports/ReviewsReportView', () => {
  return function MockReviewsReportView({ dateRange }) {
    return <div data-testid="reviews-report-view">Reviews Report: {dateRange.startDate} - {dateRange.endDate}</div>;
  };
});

const mockAppContext = {
  language: 'en',
  fontFamily: 'Arial, sans-serif',
  theme: 'light'
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockAppContext}>
      {component}
    </AppContext.Provider>
  );
};

describe('ReportsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reports page with default users report', () => {
    renderWithContext(<ReportsPage />);
    
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByTestId('users-report-view')).toBeInTheDocument();
  });

  test('switches between different report types', () => {
    renderWithContext(<ReportsPage />);
    
    // Initially shows users report
    expect(screen.getByTestId('users-report-view')).toBeInTheDocument();
    
    // Click jobs report button
    const jobsButton = screen.getByText('Jobs Report');
    fireEvent.click(jobsButton);
    expect(screen.getByTestId('jobs-report-view')).toBeInTheDocument();
    
    // Click courses report button
    const coursesButton = screen.getByText('Courses Report');
    fireEvent.click(coursesButton);
    expect(screen.getByTestId('courses-report-view')).toBeInTheDocument();
    
    // Click reviews report button
    const reviewsButton = screen.getByText('Reviews Report');
    fireEvent.click(reviewsButton);
    expect(screen.getByTestId('reviews-report-view')).toBeInTheDocument();
  });

  test('handles date range selection', () => {
    renderWithContext(<ReportsPage />);
    
    const startDateInput = screen.getAllByRole('textbox')[0];
    const endDateInput = screen.getAllByRole('textbox')[1];
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    
    expect(startDateInput.value).toBe('2024-01-01');
    expect(endDateInput.value).toBe('2024-12-31');
  });

  test('clears date range when clear button is clicked', () => {
    renderWithContext(<ReportsPage />);
    
    const startDateInput = screen.getAllByRole('textbox')[0];
    const endDateInput = screen.getAllByRole('textbox')[1];
    
    // Set dates
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    
    // Click clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(startDateInput.value).toBe('');
    expect(endDateInput.value).toBe('');
  });

  test('renders in Arabic language', () => {
    const arabicContext = { ...mockAppContext, language: 'ar' };
    
    render(
      <AppContext.Provider value={arabicContext}>
        <ReportsPage />
      </AppContext.Provider>
    );
    
    expect(screen.getByText('التقارير')).toBeInTheDocument();
    expect(screen.getByText('تقرير المستخدمين')).toBeInTheDocument();
  });

  test('renders in French language', () => {
    const frenchContext = { ...mockAppContext, language: 'fr' };
    
    render(
      <AppContext.Provider value={frenchContext}>
        <ReportsPage />
      </AppContext.Provider>
    );
    
    expect(screen.getByText('Rapports')).toBeInTheDocument();
    expect(screen.getByText('Rapport des utilisateurs')).toBeInTheDocument();
  });

  test('applies active class to selected report type button', () => {
    renderWithContext(<ReportsPage />);
    
    const usersButton = screen.getByText('Users Report');
    const jobsButton = screen.getByText('Jobs Report');
    
    // Users button should be active initially
    expect(usersButton).toHaveClass('active');
    expect(jobsButton).not.toHaveClass('active');
    
    // Click jobs button
    fireEvent.click(jobsButton);
    
    // Jobs button should now be active
    expect(jobsButton).toHaveClass('active');
    expect(usersButton).not.toHaveClass('active');
  });

  test('passes date range to report view components', () => {
    renderWithContext(<ReportsPage />);
    
    const startDateInput = screen.getAllByRole('textbox')[0];
    const endDateInput = screen.getAllByRole('textbox')[1];
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    
    const reportView = screen.getByTestId('users-report-view');
    expect(reportView).toHaveTextContent('2024-01-01 - 2024-12-31');
  });
});
