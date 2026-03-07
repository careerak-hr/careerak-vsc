import { lazy } from 'react';
import { lazyLoadWithRetry } from '../../utils/performanceOptimization';

/**
 * Lazy-loaded components for the application form
 * These components are loaded on-demand to improve initial load time
 */

// Step components - loaded when user navigates to them
export const PersonalInfoStep = lazy(() => 
  lazyLoadWithRetry(() => import('./PersonalInfoStep'))
);

export const EducationExperienceStep = lazy(() => 
  lazyLoadWithRetry(() => import('./EducationExperienceStep'))
);

export const SkillsLanguagesStep = lazy(() => 
  lazyLoadWithRetry(() => import('./SkillsLanguagesStep'))
);

export const DocumentsQuestionsStep = lazy(() => 
  lazyLoadWithRetry(() => import('./DocumentsQuestionsStep'))
);

export const ReviewSubmitStep = lazy(() => 
  lazyLoadWithRetry(() => import('./ReviewSubmitStep'))
);

// Heavy components - loaded when needed
export const FileUploadManager = lazy(() => 
  lazyLoadWithRetry(() => import('./FileUploadManager'))
);

export const ApplicationPreview = lazy(() => 
  lazyLoadWithRetry(() => import('./ApplicationPreview'))
);

export const StatusTimeline = lazy(() => 
  lazyLoadWithRetry(() => import('./StatusTimeline'))
);

// Loading fallback component
export const FormStepLoader = () => (
  <div className="form-step-loader">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);
