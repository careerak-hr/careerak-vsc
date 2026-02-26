import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersReportView from '../UsersReportView';
import { AppContext } from '../../../../context/AppContext';

// Mock fetch
global.fetch = jest.fn();

const mockAppContext = {
  language: 'en',
  fontFamily: 'Arial, sans-serif'
};

const mockReportData = {
  totalUsers: 150,
  byType: {
    jobSeeker: 80,
    company: 50,
    freelancer: 20
  },
  growthRate: 15.5,
  mostActive: [
    { name: 'John Doe', email: 'john@example.com', userType: 'jobSeeker', activityCount: 25 },
    { name: 'Jane Smith', email: 'jane@example.com', userType: 'company', activityCount: 20 }
  ],
  inactive: [
    { name: 'Bob Johnson', email: 'bob@example.com', userType: 'freelancer', lastLogin: '2024-01-01' }
  ],
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockAppContext}>
      {component}
    </AppContext.Provider>
  );
};

describe('UsersReportView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    expect(screen.getByText('Loading report...')).toBeInTheDocument();
  });

  test('fetches and displays report data successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Users Report')).toBeInTheDocument();
    });
    
    expect(screen.getByText('150')).toBeInTheDocument(); // Total users
    expect(screen.getByText('+15.5%')).toBeInTheDocument(); // Growth rate
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test('includes date range in API request when provided', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
    renderWithContext(<UsersReportView dateRange={dateRange} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-12-31'),
        expect.any(Object)
      );
    });
  });

  test('displays negative growth rate correctly', async () => {
    const negativeGrowthData = { ...mockReportData, growthRate: -10.5 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: negativeGrowthData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('-10.5%')).toBeInTheDocument();
    });
  });

  test('displays most active users table', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Most Active Users')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  test('displays inactive users table when present', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Inactive Users')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  test('does not display inactive users section when empty', async () => {
    const noInactiveData = { ...mockReportData, inactive: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: noInactiveData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Users Report')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Inactive Users')).not.toBeInTheDocument();
  });

  test('refetches data when date range changes', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    const { rerender } = renderWithContext(
      <UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    // Change date range
    rerender(
      <AppContext.Provider value={mockAppContext}>
        <UsersReportView dateRange={{ startDate: '2024-01-01', endDate: '2024-12-31' }} fontStyle={{}} />
      </AppContext.Provider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
