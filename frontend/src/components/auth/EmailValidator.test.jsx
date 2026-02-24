import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailValidator from './EmailValidator';
import { AppProvider } from '../../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock AppContext
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    language: 'ar',
  }),
  AppProvider: ({ children }) => <div>{children}</div>,
}));

describe('EmailValidator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input field', () => {
    const onChange = vi.fn();
    render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(onChange).toHaveBeenCalledWith('test@example.com');
  });

  it('shows checking state during validation', async () => {
    const onChange = vi.fn();
    
    // Mock delayed API response
    global.fetch.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: async () => ({ success: true, valid: true }),
          }),
          100
        )
      )
    );

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update value
    rerender(
      <AppProvider>
        <EmailValidator value="test@example.com" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce (500ms) + a bit more
    await waitFor(
      () => {
        expect(screen.getByText(/جاري التحقق/i)).toBeInTheDocument();
      },
      { timeout: 600 }
    );
  });

  it('shows success icon for valid email', async () => {
    const onChange = vi.fn();

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        valid: true,
        message: 'البريد الإلكتروني متاح',
      }),
    });

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update value
    rerender(
      <AppProvider>
        <EmailValidator value="test@example.com" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce + API call
    await waitFor(
      () => {
        expect(screen.getByText(/البريد الإلكتروني متاح/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('shows error icon for invalid email format', async () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update with invalid email
    rerender(
      <AppProvider>
        <EmailValidator value="notanemail" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce
    await waitFor(
      () => {
        expect(screen.getByText(/البريد الإلكتروني غير صحيح/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('shows error for existing email', async () => {
    const onChange = vi.fn();

    // Mock API response for existing email
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        valid: false,
        error: 'هذا البريد مستخدم بالفعل',
        action: 'login',
      }),
    });

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update value
    rerender(
      <AppProvider>
        <EmailValidator value="existing@example.com" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce + API call
    await waitFor(
      () => {
        expect(screen.getByText(/هذا البريد مستخدم بالفعل/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Check for login link
    const loginLink = screen.getByText(/تسجيل الدخول/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows suggestion for typo', async () => {
    const onChange = vi.fn();

    // Mock API response with suggestion
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        valid: false,
        error: 'هل تقصد',
        suggestion: 'test@gmail.com',
      }),
    });

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update with typo
    rerender(
      <AppProvider>
        <EmailValidator value="test@gmial.com" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce + API call
    await waitFor(
      () => {
        expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Click suggestion
    const suggestionButton = screen.getByText('test@gmail.com');
    fireEvent.click(suggestionButton);

    expect(onChange).toHaveBeenCalledWith('test@gmail.com');
  });

  it('debounces validation calls', async () => {
    const onChange = vi.fn();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, valid: true }),
    });

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} debounceDelay={500} />
      </AppProvider>
    );

    // Rapid changes
    rerender(
      <AppProvider>
        <EmailValidator value="t" onChange={onChange} debounceDelay={500} />
      </AppProvider>
    );

    rerender(
      <AppProvider>
        <EmailValidator value="te" onChange={onChange} debounceDelay={500} />
      </AppProvider>
    );

    rerender(
      <AppProvider>
        <EmailValidator value="test@example.com" onChange={onChange} debounceDelay={500} />
      </AppProvider>
    );

    // Wait for debounce
    await waitFor(
      () => {
        // Should only call API once after debounce
        expect(global.fetch).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );
  });

  it('handles API errors gracefully', async () => {
    const onChange = vi.fn();

    // Mock API error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { rerender } = render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} />
      </AppProvider>
    );

    // Update value
    rerender(
      <AppProvider>
        <EmailValidator value="test@example.com" onChange={onChange} />
      </AppProvider>
    );

    // Wait for debounce + API call
    await waitFor(
      () => {
        expect(screen.getByText(/حدث خطأ في الاتصال/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('respects disabled prop', () => {
    const onChange = vi.fn();
    render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} disabled={true} />
      </AppProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('respects required prop', () => {
    const onChange = vi.fn();
    render(
      <AppProvider>
        <EmailValidator value="" onChange={onChange} required={true} />
      </AppProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });
});
