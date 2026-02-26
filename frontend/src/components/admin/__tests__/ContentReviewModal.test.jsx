import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentReviewModal from '../ContentReviewModal';
import { AppContext } from '../../../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage;

// Mock context
const mockContextValue = {
  language: 'en',
  fontFamily: 'Arial, sans-serif'
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockContextValue}>
      {component}
    </AppContext.Provider>
  );
};

const mockJob = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'Tech Corp' },
  field: 'IT',
  description: 'Great job opportunity',
  createdAt: new Date().toISOString(),
  status: 'pending'
};

const mockCourse = {
  _id: 'course123',
  title: 'React Masterclass',
  postedBy: { name: 'John Doe' },
  field: 'Programming',
  description: 'Learn React',
  createdAt: new Date().toISOString(),
  status: 'pending'
};

const mockReview = {
  _id: 'review123',
  overallRating: 5,
  comment: 'Great experience',
  flaggedBy: ['user1', 'user2'],
  flagReason: 'Inappropriate content',
  createdAt: new Date().toISOString()
};

describe('ContentReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnActionComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render modal with job content', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('Review Content')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText(/Tech Corp/)).toBeInTheDocument();
    });

    it('should render modal with course content', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockCourse}
          contentType="course"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('React Masterclass')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should render modal with review content', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockReview}
          contentType="review"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText(/Great experience/)).toBeInTheDocument();
      expect(screen.getByText(/2 users/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Approve Action', () => {
    it('should show approve confirmation', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      expect(screen.getByText(/Are you sure you want to approve this content/)).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should call API on approve confirmation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Approved' })
      });

      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/content/job123/approve'),
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            }),
            body: JSON.stringify({ contentType: 'job' })
          })
        );
      });

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      });
    });

    it('should handle approve errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Approval failed' })
      });

      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Approval failed/)).toBeInTheDocument();
      });

      expect(mockOnActionComplete).not.toHaveBeenCalled();
    });
  });

  describe('Reject Action', () => {
    it('should show reject confirmation with reason input', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      expect(screen.getByText(/Are you sure you want to reject this content/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Rejection Reason/)).toBeInTheDocument();
      expect(screen.getByText('Send feedback to creator')).toBeInTheDocument();
    });

    it('should require rejection reason', async () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Rejection reason is required')).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call API on reject with reason', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Rejected' })
      });

      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      const reasonInput = screen.getByLabelText(/Rejection Reason/);
      fireEvent.change(reasonInput, { target: { value: 'Does not meet requirements' } });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/content/job123/reject'),
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ 
              contentType: 'job', 
              reason: 'Does not meet requirements' 
            })
          })
        );
      });

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      });
    });

    it('should toggle send feedback checkbox', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      const checkbox = screen.getByLabelText('Send feedback to creator');
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Delete Action', () => {
    it('should show delete confirmation', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(screen.getByText(/Are you sure you want to delete this content/)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('should call API on delete confirmation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Deleted' })
      });

      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/content/job123?contentType=job'),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should go back from confirmation', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      expect(screen.getByText(/Are you sure you want to approve/)).toBeInTheDocument();

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(screen.queryByText(/Are you sure you want to approve/)).not.toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('should close modal on cancel', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal on X button', () => {
      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal on overlay click', () => {
      const { container } = renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close modal on content click', () => {
      const { container } = renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const modalContent = container.querySelector('.modal-content');
      fireEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons during loading', async () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {}));

      renderWithContext(
        <ContentReviewModal
          content={mockJob}
          contentType="job"
          onClose={mockOnClose}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        if (button.textContent !== 'Processing...') {
          expect(button).toBeDisabled();
        }
      });
    });
  });
});
