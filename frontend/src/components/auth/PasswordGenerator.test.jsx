import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import PasswordGenerator from './PasswordGenerator';

/**
 * Unit Tests for PasswordGenerator Component
 * 
 * **Validates: Requirements 3.2**
 * 
 * Tests:
 * 1. كلمة المرور تحتوي على جميع الأنواع (uppercase, lowercase, number, special)
 * 2. الطول الصحيح (14 حرف)
 * 3. العشوائية (كلمات مرور مختلفة)
 * 4. نسخ كلمة المرور
 * 5. توليد كلمة مرور جديدة
 * 6. استدعاء callback
 * 7. دعم اللغات المتعددة
 */

describe('PasswordGenerator Component', () => {
  
  /**
   * Test 1: Rendering
   */
  describe('Rendering', () => {
    it('should render suggest button', () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      expect(button).toBeInTheDocument();
    });

    it('should not show generated password initially', () => {
      render(<PasswordGenerator />);
      
      const codeElement = screen.queryByRole('code');
      expect(codeElement).not.toBeInTheDocument();
    });

    it('should render in English', () => {
      render(<PasswordGenerator language="en" />);
      
      const button = screen.getByRole('button', { name: /suggest strong password/i });
      expect(button).toBeInTheDocument();
    });

    it('should render in French', () => {
      render(<PasswordGenerator language="fr" />);
      
      const button = screen.getByRole('button', { name: /suggérer un mot de passe fort/i });
      expect(button).toBeInTheDocument();
    });
  });

  /**
   * Test 2: Password Generation
   */
  describe('Password Generation', () => {
    it('should generate password when button is clicked', async () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        const codeElement = screen.getByRole('code');
        expect(codeElement).toBeInTheDocument();
        expect(codeElement.textContent).toMatch(/[A-Za-z0-9!@#$%^&*(),.?":{}|<>]+/);
      });
    });

    it('should generate password with correct length (14 characters)', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalled();
        const generatedPassword = onGenerate.mock.calls[0][0];
        expect(generatedPassword).toHaveLength(14);
      });
    });

    it('should generate password with uppercase letter', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalled();
        const generatedPassword = onGenerate.mock.calls[0][0];
        expect(/[A-Z]/.test(generatedPassword)).toBe(true);
      });
    });

    it('should generate password with lowercase letter', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalled();
        const generatedPassword = onGenerate.mock.calls[0][0];
        expect(/[a-z]/.test(generatedPassword)).toBe(true);
      });
    });

    it('should generate password with number', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalled();
        const generatedPassword = onGenerate.mock.calls[0][0];
        expect(/[0-9]/.test(generatedPassword)).toBe(true);
      });
    });

    it('should generate password with special character', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalled();
        const generatedPassword = onGenerate.mock.calls[0][0];
        expect(/[!@#$%^&*(),.?":{}|<>]/.test(generatedPassword)).toBe(true);
      });
    });

    it('should generate different passwords each time', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      
      // توليد كلمة مرور أولى
      fireEvent.click(button);
      await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(1));
      const password1 = onGenerate.mock.calls[0][0];

      // توليد كلمة مرور ثانية
      fireEvent.click(button);
      await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(2));
      const password2 = onGenerate.mock.calls[1][0];

      // توليد كلمة مرور ثالثة
      fireEvent.click(button);
      await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(3));
      const password3 = onGenerate.mock.calls[2][0];

      // يجب أن تكون جميع كلمات المرور مختلفة
      expect(password1).not.toBe(password2);
      expect(password2).not.toBe(password3);
      expect(password1).not.toBe(password3);
    });
  });

  /**
   * Test 3: Copy Functionality
   */
  describe('Copy Functionality', () => {
    // Mock clipboard API
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });
    });

    it('should show copy button after generating password', async () => {
      render(<PasswordGenerator />);
      
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /نسخ/i });
        expect(copyButton).toBeInTheDocument();
      });
    });

    it('should copy password to clipboard when copy button is clicked', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      // توليد كلمة مرور
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => expect(onGenerate).toHaveBeenCalled());
      const generatedPassword = onGenerate.mock.calls[0][0];

      // نسخ كلمة المرور
      const copyButton = screen.getByRole('button', { name: /نسخ/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(generatedPassword);
      });
    });

    it('should show success message after copying', async () => {
      render(<PasswordGenerator />);
      
      // توليد كلمة مرور
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /نسخ/i });
        expect(copyButton).toBeInTheDocument();
      });

      // نسخ كلمة المرور
      const copyButton = screen.getByRole('button', { name: /نسخ/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        const successMessage = screen.getByText(/تم النسخ/i);
        expect(successMessage).toBeInTheDocument();
      });
    });

    it('should show check icon after copying', async () => {
      render(<PasswordGenerator />);
      
      // توليد كلمة مرور
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /نسخ/i });
        expect(copyButton).toBeInTheDocument();
      });

      // نسخ كلمة المرور
      const copyButton = screen.getByRole('button', { name: /نسخ/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        // التحقق من وجود أيقونة Check (✓)
        const checkIcon = copyButton.querySelector('svg');
        expect(checkIcon).toHaveClass('text-green-600');
      });
    });
  });

  /**
   * Test 4: Regenerate Functionality
   */
  describe('Regenerate Functionality', () => {
    it('should show regenerate button after generating password', async () => {
      render(<PasswordGenerator />);
      
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const regenerateButton = screen.getByRole('button', { name: /توليد جديد/i });
        expect(regenerateButton).toBeInTheDocument();
      });
    });

    it('should generate new password when regenerate button is clicked', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      // توليد كلمة مرور أولى
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(1));
      const password1 = onGenerate.mock.calls[0][0];

      // توليد كلمة مرور جديدة
      const regenerateButton = screen.getByRole('button', { name: /توليد جديد/i });
      fireEvent.click(regenerateButton);

      await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(2));
      const password2 = onGenerate.mock.calls[1][0];

      // يجب أن تكون كلمة المرور الجديدة مختلفة
      expect(password1).not.toBe(password2);
    });

    it('should reset copied state when regenerating', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });

      render(<PasswordGenerator />);
      
      // توليد كلمة مرور
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /نسخ/i });
        expect(copyButton).toBeInTheDocument();
      });

      // نسخ كلمة المرور
      const copyButton = screen.getByRole('button', { name: /نسخ/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        const successMessage = screen.getByText(/تم النسخ/i);
        expect(successMessage).toBeInTheDocument();
      });

      // توليد كلمة مرور جديدة
      const regenerateButton = screen.getByRole('button', { name: /توليد جديد/i });
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        // رسالة النجاح يجب أن تختفي
        const successMessage = screen.queryByText(/تم النسخ/i);
        expect(successMessage).not.toBeInTheDocument();
      });
    });
  });

  /**
   * Test 5: Callback
   */
  describe('Callback', () => {
    it('should call onGenerate callback when password is generated', async () => {
      const onGenerate = vi.fn();
      render(<PasswordGenerator onGenerate={onGenerate} />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalledTimes(1);
        expect(onGenerate).toHaveBeenCalledWith(expect.any(String));
      });
    });

    it('should work without onGenerate callback', async () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      
      // يجب ألا يحدث خطأ
      expect(() => fireEvent.click(button)).not.toThrow();

      await waitFor(() => {
        const codeElement = screen.getByRole('code');
        expect(codeElement).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 6: Loading State
   */
  describe('Loading State', () => {
    it('should disable button while generating', async () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      // يجب أن يكون الزر معطلاً مؤقتاً
      expect(button).toBeDisabled();

      // يجب أن يتم تفعيله بعد التوليد
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should show rotating icon while generating', async () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(button);

      // التحقق من وجود class rotating
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('rotating');

      // يجب أن تختفي animation بعد التوليد
      await waitFor(() => {
        expect(icon).not.toHaveClass('rotating');
      });
    });
  });

  /**
   * Test 7: Accessibility
   */
  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<PasswordGenerator />);
      
      const suggestButton = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      fireEvent.click(suggestButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /نسخ/i });
        const regenerateButton = screen.getByRole('button', { name: /توليد جديد/i });
        
        expect(copyButton).toHaveAttribute('aria-label');
        expect(regenerateButton).toHaveAttribute('aria-label');
      });
    });

    it('should have proper button types', () => {
      render(<PasswordGenerator />);
      
      const button = screen.getByRole('button', { name: /اقتراح كلمة مرور قوية/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});

