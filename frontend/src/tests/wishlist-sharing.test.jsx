import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WishlistButton from '../components/Courses/WishlistButton';
import WishlistPage from '../pages/WishlistPage';
import ShareModal from '../components/Courses/ShareModal';
import { AppProvider } from '../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock window.open
global.open = vi.fn();

// Helper to wrap components with providers
const renderWithProviders = (component, appContextValue = {}) => {
  const defaultContext = {
    user: { _id: 'user123', name: 'Test User' },
    language: 'en',
    ...appContextValue,
  };

  return render(
    <BrowserRouter>
      <AppProvider value={defaultContext}>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('WishlistButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token');
  });

  it('renders wishlist button', () => {
    renderWithProviders(<WishlistButton courseId="course123" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('checks wishlist status on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    });

    renderWithProviders(<WishlistButton courseId="course123" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });
  });

  it('adds course to wishlist on click', async () => {
    // Mock initial check (not in wishlist)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    });

    // Mock add to wishlist
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProviders(<WishlistButton courseId="course123" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist/course123'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('removes course from wishlist on click when already wishlisted', async () => {
    // Mock initial check (in wishlist)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        courses: [{ course: { _id: 'course123' } }],
      }),
    });

    // Mock remove from wishlist
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProviders(<WishlistButton courseId="course123" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist/course123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('shows loading state while toggling', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    });

    fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        )
    );

    renderWithProviders(<WishlistButton courseId="course123" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toHaveClass('loading');
  });

  it('requires authentication', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithProviders(<WishlistButton courseId="course123" />, { user: null });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('login'));
    alertSpy.mockRestore();
  });
});

describe('WishlistPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token');
  });

  it('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    renderWithProviders(<WishlistPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state when wishlist is empty', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/empty/i)).toBeInTheDocument();
    });
  });

  it('renders wishlist items', async () => {
    const mockWishlist = {
      courses: [
        {
          course: {
            _id: 'course1',
            title: 'Test Course 1',
            description: 'Description 1',
          },
          addedAt: new Date().toISOString(),
          notes: 'My notes',
        },
        {
          course: {
            _id: 'course2',
            title: 'Test Course 2',
            description: 'Description 2',
          },
          addedAt: new Date().toISOString(),
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWishlist,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    });
  });

  it('removes course from wishlist', async () => {
    const mockWishlist = {
      courses: [
        {
          course: {
            _id: 'course1',
            title: 'Test Course 1',
          },
          addedAt: new Date().toISOString(),
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWishlist,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist/course1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('adds and saves notes', async () => {
    const mockWishlist = {
      courses: [
        {
          course: {
            _id: 'course1',
            title: 'Test Course 1',
          },
          addedAt: new Date().toISOString(),
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWishlist,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    const addNotesButton = screen.getByText(/add notes/i);
    fireEvent.click(addNotesButton);

    const textarea = screen.getByPlaceholderText(/notes/i);
    fireEvent.change(textarea, { target: { value: 'My new notes' } });

    const saveButton = screen.getByText(/save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist/course1/notes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ notes: 'My new notes' }),
        })
      );
    });
  });
});

describe('ShareModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token');
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <ShareModal isOpen={false} onClose={() => {}} courseId="course123" courseTitle="Test Course" />
    );

    expect(screen.queryByText(/share/i)).not.toBeInTheDocument();
  });

  it('generates share URL on open', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareUrl: 'https://example.com/share/abc123' }),
    });

    renderWithProviders(
      <ShareModal isOpen={true} onClose={() => {}} courseId="course123" courseTitle="Test Course" />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/course123/share'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });
  });

  it('copies link to clipboard', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareUrl: 'https://example.com/share/abc123' }),
    });

    navigator.clipboard.writeText.mockResolvedValueOnce();

    renderWithProviders(
      <ShareModal isOpen={true} onClose={() => {}} courseId="course123" courseTitle="Test Course" />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });

    const copyButton = screen.getByText(/copy link/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share/abc123');
    });

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('opens social share links', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareUrl: 'https://example.com/share/abc123' }),
    });

    renderWithProviders(
      <ShareModal isOpen={true} onClose={() => {}} courseId="course123" courseTitle="Test Course" />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });

    const facebookButton = screen.getByLabelText(/facebook/i);
    fireEvent.click(facebookButton);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('closes modal on backdrop click', async () => {
    const onClose = vi.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareUrl: 'https://example.com/share/abc123' }),
    });

    renderWithProviders(
      <ShareModal isOpen={true} onClose={onClose} courseId="course123" courseTitle="Test Course" />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });

    const backdrop = screen.getByRole('button', { name: /close/i }).parentElement.parentElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('tracks share events', async () => {
    const gtagMock = vi.fn();
    window.gtag = gtagMock;

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareUrl: 'https://example.com/share/abc123' }),
    });

    renderWithProviders(
      <ShareModal isOpen={true} onClose={() => {}} courseId="course123" courseTitle="Test Course" />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });

    // Track generate event
    expect(gtagMock).toHaveBeenCalledWith('event', 'share', {
      method: 'generate',
      content_type: 'course',
      content_id: 'course123',
    });

    // Track copy event
    navigator.clipboard.writeText.mockResolvedValueOnce();
    const copyButton = screen.getByText(/copy link/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(gtagMock).toHaveBeenCalledWith('event', 'share', {
        method: 'copy',
        content_type: 'course',
        content_id: 'course123',
      });
    });

    delete window.gtag;
  });
});
