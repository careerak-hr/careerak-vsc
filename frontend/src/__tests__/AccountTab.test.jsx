import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountTab from '../components/Settings/AccountTab';
import { AppContext } from '../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock context
const mockUser = {
  _id: '123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+966500000000',
  language: 'en',
  timezone: 'Asia/Riyadh',
  profilePicture: null,
};

const mockContextValue = {
  user: mockUser,
  language: 'en',
  updateUser: vi.fn(),
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockContextValue}>
      {component}
    </AppContext.Provider>
  );
};

describe('AccountTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Profile Update', () => {
    it('should render profile edit form', () => {
      renderWithContext(<AccountTab />);
      
      expect(screen.getByRole('heading', { name: /Profile/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
      // Email and Phone are in the Security section, not in the form
      expect(screen.getByText(/Current Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Current Phone/i)).toBeInTheDocument();
    });

    it('should update profile successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { ...mockUser, name: 'Updated Name' } }),
      });

      renderWithContext(<AccountTab />);
      
      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByRole('button', { name: /Save/i });

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/settings/profile',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error on profile update failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Update failed' }),
      });

      renderWithContext(<AccountTab />);
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload', () => {
    it('should reject oversized image (> 5MB)', async () => {
      renderWithContext(<AccountTab />);
      
      const file = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/Upload Image|Change Image/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Image too large/i)).toBeInTheDocument();
      });
    });

    it('should reject invalid image format', async () => {
      renderWithContext(<AccountTab />);
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Upload Image|Change Image/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid image format/i)).toBeInTheDocument();
      });
    });

    it('should accept valid image (< 5MB, valid format)', async () => {
      renderWithContext(<AccountTab />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const input = screen.getByLabelText(/Upload Image|Change Image/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Crop Image/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Change Flow', () => {
    it('should open email change modal', () => {
      renderWithContext(<AccountTab />);
      
      const changeEmailButton = screen.getByRole('button', { name: /Change Email/i });
      fireEvent.click(changeEmailButton);

      expect(screen.getByText(/Change Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/New Email/i)).toBeInTheDocument();
    });

    it('should complete email change flow', async () => {
      // Step 1: Enter new email
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Step 2: Verify old email
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Step 3: Verify new email
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Step 4: Confirm password
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithContext(<AccountTab />);
      
      const changeEmailButton = screen.getByRole('button', { name: /Change Email/i });
      fireEvent.click(changeEmailButton);

      // Step 1
      const newEmailInput = screen.getByLabelText(/New Email/i);
      fireEvent.change(newEmailInput, { target: { value: 'newemail@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Old Email OTP/i)).toBeInTheDocument();
      });

      // Step 2
      const oldOTPInput = screen.getByLabelText(/Old Email OTP/i);
      fireEvent.change(oldOTPInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/New Email OTP/i)).toBeInTheDocument();
      });

      // Step 3
      const newOTPInput = screen.getByLabelText(/New Email OTP/i);
      fireEvent.change(newOTPInput, { target: { value: '654321' } });
      fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      });

      // Step 4
      const passwordInput = screen.getByLabelText(/Password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email changed successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error for email already in use', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already in use' }),
      });

      renderWithContext(<AccountTab />);
      
      const changeEmailButton = screen.getByRole('button', { name: /Change Email/i });
      fireEvent.click(changeEmailButton);

      const newEmailInput = screen.getByLabelText(/New Email/i);
      fireEvent.change(newEmailInput, { target: { value: 'existing@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
      });
    });
  });

  describe('Phone Change Flow', () => {
    it('should open phone change modal', () => {
      renderWithContext(<AccountTab />);
      
      const changePhoneButton = screen.getByRole('button', { name: /Change Phone/i });
      fireEvent.click(changePhoneButton);

      expect(screen.getByText(/Change Phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/New Phone/i)).toBeInTheDocument();
    });

    it('should complete phone change flow', async () => {
      // Step 1: Enter new phone
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Step 2: Verify OTP
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithContext(<AccountTab />);
      
      const changePhoneButton = screen.getByRole('button', { name: /Change Phone/i });
      fireEvent.click(changePhoneButton);

      // Step 1
      const newPhoneInput = screen.getByLabelText(/New Phone/i);
      fireEvent.change(newPhoneInput, { target: { value: '+966501234567' } });
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
      });

      // Step 2
      const otpInput = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(otpInput, { target: { value: '123456' } });
      fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

      await waitFor(() => {
        expect(screen.getByText(/Phone number changed successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error for phone already in use', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Phone number already in use' }),
      });

      renderWithContext(<AccountTab />);
      
      const changePhoneButton = screen.getByRole('button', { name: /Change Phone/i });
      fireEvent.click(changePhoneButton);

      const newPhoneInput = screen.getByLabelText(/New Phone/i);
      fireEvent.change(newPhoneInput, { target: { value: '+966500000000' } });
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Phone number already in use/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Change Flow', () => {
    it('should open password change modal', () => {
      renderWithContext(<AccountTab />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);

      expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    it('should reject weak password', async () => {
      renderWithContext(<AccountTab />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

      const changeButton = screen.getByRole('button', { name: /Change/i });
      expect(changeButton).toBeDisabled();
    });

    it('should reject mismatched passwords', async () => {
      renderWithContext(<AccountTab />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });

      fireEvent.click(screen.getByRole('button', { name: /Change/i }));

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should complete password change successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithContext(<AccountTab />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'OldPass123!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      // Wait for password strength to be calculated
      await waitFor(() => {
        const changeButton = screen.getByRole('button', { name: /Change/i });
        expect(changeButton).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /Change/i }));

      await waitFor(() => {
        expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument();
      });
    });

    it('should show error for wrong current password', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid password' }),
      });

      renderWithContext(<AccountTab />);
      
      const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });
      fireEvent.click(changePasswordButton);

      const currentPasswordInput = screen.getByLabelText(/Current Password/i);
      const newPasswordInput = screen.getByLabelText(/New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      fireEvent.change(currentPasswordInput, { target: { value: 'WrongPass123!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });

      await waitFor(() => {
        const changeButton = screen.getByRole('button', { name: /Change/i });
        expect(changeButton).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /Change/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should close modal on cancel button click', () => {
      renderWithContext(<AccountTab />);
      
      const changeEmailButton = screen.getByRole('button', { name: /Change Email/i });
      fireEvent.click(changeEmailButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close modal on overlay click', () => {
      renderWithContext(<AccountTab />);
      
      const changeEmailButton = screen.getByRole('button', { name: /Change Email/i });
      fireEvent.click(changeEmailButton);

      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay);

      expect(screen.queryByText(/New Email/i)).not.toBeInTheDocument();
    });
  });
});
