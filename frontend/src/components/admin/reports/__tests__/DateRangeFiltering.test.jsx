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
  byType: { jobSeeker: 80, company: 50, freelancer: 20 },
  growthRate: 15.5,
  mostActive: [],
  inactive: [],
  dateRange: { start: null, end: null }
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockAppContext}>
      {component}
    </AppContext.Provider>
  );
};

describe('Date Range Filtering Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('fetches report without date range when not provided', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(<UsersReportView dateRange={{ startDate: '', endDate: '' }} fontStyle={{}} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/admin\/reports\/users\?$/),
        expect.any(Object)
      );
    });
  });

  test('includes start date in API request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '2024-01-01', endDate: '' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
    });
  });

  test('includes end date in API request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '', endDate: '2024-12-31' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-12-31'),
        expect.any(Object)
      );
    });
  });

  test('includes both start and end dates in API request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '2024-01-01', endDate: '2024-12-31' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      const fetchCall = fetch.mock.calls[0][0];
      expect(fetchCall).toContain('startDate=2024-01-01');
      expect(fetchCall).toContain('endDate=2024-12-31');
    });
  });

  test('refetches data when start date changes', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    const { rerender } = renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '', endDate: '' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    // Change start date
    rerender(
      <AppContext.Provider value={mockAppContext}>
        <UsersReportView 
          dateRange={{ startDate: '2024-01-01', endDate: '' }} 
          fontStyle={{}} 
        />
      </AppContext.Provider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('refetches data when end date changes', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    const { rerender } = renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '', endDate: '' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    // Change end date
    rerender(
      <AppContext.Provider value={mockAppContext}>
        <UsersReportView 
          dateRange={{ startDate: '', endDate: '2024-12-31' }} 
          fontStyle={{}} 
        />
      </AppContext.Provider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('refetches data when both dates change', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    const { rerender } = renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '', endDate: '' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    // Change both dates
    rerender(
      <AppContext.Provider value={mockAppContext}>
        <UsersReportView 
          dateRange={{ startDate: '2024-01-01', endDate: '2024-12-31' }} 
          fontStyle={{}} 
        />
      </AppContext.Provider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty date range correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '', endDate: '' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      const fetchCall = fetch.mock.calls[0][0];
      expect(fetchCall).not.toContain('startDate=');
      expect(fetchCall).not.toContain('endDate=');
    });
  });

  test('properly encodes date values in URL', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockReportData })
    });
    
    renderWithContext(
      <UsersReportView 
        dateRange={{ startDate: '2024-01-01', endDate: '2024-12-31' }} 
        fontStyle={{}} 
      />
    );
    
    await waitFor(() => {
      const fetchCall = fetch.mock.calls[0][0];
      // Check that dates are properly encoded (no spaces or special chars)
      expect(fetchCall).toMatch(/startDate=2024-01-01/);
      expect(fetchCall).toMatch(/endDate=2024-12-31/);
    });
  });
});
