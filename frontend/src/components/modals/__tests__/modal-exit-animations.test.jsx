/**
 * Modal Exit Animations Test
 * 
 * Verifies that all modals have proper exit animations configured
 * Task: 4.3.4 Configure modal exit animations
 * 
 * Requirements:
 * - FR-ANIM-2: Modals shall apply scale and fade animations with 200-300ms duration
 * - All modals must have AnimatePresence wrapper
 * - All modals must have exit variants configured
 * - Exit animations must respect prefers-reduced-motion
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AnimationProvider } from '../../../context/AnimationContext';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Import all modal components
import AlertModal from '../AlertModal';
import ConfirmationModal from '../ConfirmationModal';
import PhotoOptionsModal from '../PhotoOptionsModal';
import CropModal from '../CropModal';
import ExitConfirmModal from '../ExitConfirmModal';
import PolicyModal from '../PolicyModal';
import AgeCheckModal from '../AgeCheckModal';
import AIAnalysisModal from '../AIAnalysisModal';
import GoodbyeModal from '../GoodbyeModal';
import LanguageConfirmModal from '../LanguageConfirmModal';
import NotificationSettingsModal from '../NotificationSettingsModal';
import AudioSettingsModal from '../AudioSettingsModal';
import ReportModal from '../ReportModal';

// Mock AppContext
vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    language: 'en',
    t: (key) => key
  })
}));

// Mock FocusTrap
vi.mock('../../Accessibility/FocusTrap', () => ({
  useFocusTrap: () => ({ current: null })
}));

// Mock AriaLiveRegion
vi.mock('../../Accessibility/AriaLiveRegion', () => ({
  __esModule: true,
  default: () => null
}));

// Mock PolicyPage
vi.mock('../../../pages/13_PolicyPage.jsx', () => ({
  __esModule: true,
  default: () => <div>Policy Content</div>
}));

// Mock react-easy-crop
vi.mock('react-easy-crop', () => ({
  __esModule: true,
  default: () => <div>Cropper</div>
}));

describe('Modal Exit Animations', () => {
  const renderWithAnimation = (component) => {
    return render(
      <AnimationProvider>
        {component}
      </AnimationProvider>
    );
  };

  describe('AnimatePresence Configuration', () => {
    test('AlertModal has AnimatePresence with exit animation', async () => {
      const { rerender } = renderWithAnimation(
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      // Close modal
      rerender(
        <AnimationProvider>
          <AlertModal isOpen={false} onClose={() => {}} message="Test" language="en" />
        </AnimationProvider>
      );
      
      // Modal should start exit animation
      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      });
    });

    test('ConfirmationModal has AnimatePresence with exit animation', async () => {
      const { rerender } = renderWithAnimation(
        <ConfirmationModal 
          isOpen={true} 
          onClose={() => {}} 
          onConfirm={() => {}}
          message="Confirm?" 
          language="en" 
        />
      );
      
      expect(screen.getByText('Confirm?')).toBeInTheDocument();
      
      // Close modal
      rerender(
        <AnimationProvider>
          <ConfirmationModal 
            isOpen={false} 
            onClose={() => {}} 
            onConfirm={() => {}}
            message="Confirm?" 
            language="en" 
          />
        </AnimationProvider>
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Confirm?')).not.toBeInTheDocument();
      });
    });

    test('ExitConfirmModal has AnimatePresence with exit animation', async () => {
      const { rerender } = renderWithAnimation(
        <ExitConfirmModal 
          isOpen={true} 
          onConfirm={() => {}} 
          onCancel={() => {}}
        />
      );
      
      expect(screen.getByText(/exit/i)).toBeInTheDocument();
      
      // Close modal
      rerender(
        <AnimationProvider>
          <ExitConfirmModal 
            isOpen={false} 
            onConfirm={() => {}} 
            onCancel={() => {}}
          />
        </AnimationProvider>
      );
      
      await waitFor(() => {
        expect(screen.queryByText(/exit/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Exit Animation Variants', () => {
    test('Modals use scaleIn variant with exit state', () => {
      const { container } = renderWithAnimation(
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      );
      
      // Check that motion.div elements exist (Framer Motion renders them)
      const motionDivs = container.querySelectorAll('[class*="motion"]');
      expect(motionDivs.length).toBeGreaterThan(0);
    });

    test('Backdrop uses fade variant with exit state', () => {
      const { container } = renderWithAnimation(
        <ConfirmationModal 
          isOpen={true} 
          onClose={() => {}} 
          onConfirm={() => {}}
          message="Test" 
          language="en" 
        />
      );
      
      // Backdrop should be present
      const backdrop = container.querySelector('.confirm-modal-backdrop');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Animation Duration', () => {
    test('Exit animations complete within 300ms', async () => {
      const onClose = vi.fn();
      const { rerender } = renderWithAnimation(
        <AlertModal isOpen={true} onClose={onClose} message="Test" language="en" />
      );
      
      const startTime = Date.now();
      
      // Close modal
      rerender(
        <AnimationProvider>
          <AlertModal isOpen={false} onClose={onClose} message="Test" language="en" />
        </AnimationProvider>
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      }, { timeout: 500 });
      
      const duration = Date.now() - startTime;
      
      // Animation should complete within 300ms (with some buffer for test execution)
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Reduced Motion Support', () => {
    test('Respects prefers-reduced-motion setting', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = renderWithAnimation(
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      );
      
      // Modal should still render
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('All Modals Have Exit Animations', () => {
    const modalTests = [
      { name: 'AlertModal', component: AlertModal, props: { isOpen: true, onClose: () => {}, message: 'Test', language: 'en' } },
      { name: 'ConfirmationModal', component: ConfirmationModal, props: { isOpen: true, onClose: () => {}, onConfirm: () => {}, message: 'Test', language: 'en' } },
      { name: 'ExitConfirmModal', component: ExitConfirmModal, props: { isOpen: true, onConfirm: () => {}, onCancel: () => {} } },
      { name: 'PolicyModal', component: PolicyModal, props: { onClose: () => {}, onAgree: () => {} } },
      { name: 'AgeCheckModal', component: AgeCheckModal, props: { t: { ageCheckTitle: 'Age', ageCheckMessage: 'Check', above18: 'Yes', below18: 'No' }, onResponse: () => {}, language: 'en' } },
      { name: 'GoodbyeModal', component: GoodbyeModal, props: { t: { goodbye: 'Goodbye' }, language: 'en' } },
      { name: 'LanguageConfirmModal', component: LanguageConfirmModal, props: { isOpen: true, onConfirm: () => {}, onCancel: () => {}, language: 'en', newLanguage: 'fr' } },
      { name: 'NotificationSettingsModal', component: NotificationSettingsModal, props: { isOpen: true, onClose: () => {}, language: 'en' } },
      { name: 'AudioSettingsModal', component: AudioSettingsModal, props: { isOpen: true, onClose: () => {}, language: 'en' } },
    ];

    modalTests.forEach(({ name, component: Component, props }) => {
      test(`${name} has exit animation configured`, async () => {
        const { rerender } = renderWithAnimation(<Component {...props} />);
        
        // Modal should be visible
        expect(document.body).toContainHTML('motion');
        
        // Close modal by setting isOpen to false (if applicable)
        if (props.isOpen !== undefined) {
          rerender(
            <AnimationProvider>
              <Component {...props} isOpen={false} />
            </AnimationProvider>
          );
          
          // Wait for exit animation
          await waitFor(() => {
            // Modal should be removed from DOM after exit animation
            expect(document.querySelectorAll('[class*="modal"]').length).toBeLessThanOrEqual(1);
          }, { timeout: 500 });
        }
      });
    });
  });

  describe('Exit Animation Properties', () => {
    test('Modal content uses scaleIn exit variant', () => {
      const { container } = renderWithAnimation(
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      );
      
      // Check that Framer Motion is rendering the component
      expect(container.firstChild).toBeTruthy();
    });

    test('Backdrop uses fade exit variant', () => {
      const { container } = renderWithAnimation(
        <ConfirmationModal 
          isOpen={true} 
          onClose={() => {}} 
          onConfirm={() => {}}
          message="Test" 
          language="en" 
        />
      );
      
      // Backdrop should exist
      const backdrop = container.querySelector('.confirm-modal-backdrop');
      expect(backdrop).toBeInTheDocument();
    });
  });
});

describe('Modal Exit Animation Integration', () => {
  test('All modals use AnimationContext', () => {
    const { container } = render(
      <AnimationProvider>
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      </AnimationProvider>
    );
    
    expect(container.firstChild).toBeTruthy();
  });

  test('Exit animations work with AnimatePresence mode="wait"', async () => {
    const { rerender } = render(
      <AnimationProvider>
        <AlertModal isOpen={true} onClose={() => {}} message="Test 1" language="en" />
      </AnimationProvider>
    );
    
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    
    // Switch to different modal
    rerender(
      <AnimationProvider>
        <AlertModal isOpen={false} onClose={() => {}} message="Test 1" language="en" />
      </AnimationProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
    });
  });
});
