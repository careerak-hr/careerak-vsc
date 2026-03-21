# Component Documentation: Apply Page Enhancements

## Overview

This document provides comprehensive documentation for all React components in the Apply Page Enhancements feature. Each component is documented with props, usage examples, state management patterns, and custom hooks.

## Table of Contents

- [Core Components](#core-components)
- [Form Step Components](#form-step-components)
- [Utility Components](#utility-components)
- [Context and State Management](#context-and-state-management)
- [Custom Hooks](#custom-hooks)
- [Usage Examples](#usage-examples)

---

## Core Components

### ApplicationFormContainer

Main container component that orchestrates the entire application flow.

**Location:** `frontend/src/components/applications/ApplicationFormContainer.jsx`

**Props:**

```typescript
interface ApplicationFormContainerProps {
  jobPostingId: string;           // Required: ID of the job posting
  onSubmitSuccess: (applicationId: string) => void;  // Callback on successful submission
  onCancel: () => void;            // Callback when user cancels
}
```

**State Management:**

Uses `ApplicationContext` and `useReducer` for complex state management.

**Usage Example:**

```jsx
import ApplicationFormContainer from './components/applications/ApplicationFormContainer';

function JobDetailsPage({ jobId }) {
  const navigate = useNavigate();

  const handleSubmitSuccess = (applicationId) => {
    console.log('Application submitted:', applicationId);
    navigate(`/applications/${applicationId}`);
  };

  const handleCancel = () => {
    navigate('/job-postings');
  };

  return (
    <ApplicationFormContainer
      jobPostingId={jobId}
      onSubmitSuccess={handleSubmitSuccess}
      onCancel={handleCancel}
    />
  );
}
```

**Key Features:**
- Auto-loads user profile for auto-fill
- Checks for existing drafts
- Manages multi-step navigation
- Handles auto-save with debouncing
- Integrates with all child components

---

### MultiStepForm

Renders the current step and manages navigation between steps.

**Location:** `frontend/src/components/applications/MultiStepForm.jsx`

**Props:**

```typescript
interface MultiStepFormProps {
  currentStep: number;             // Current step (1-5)
  totalSteps: number;              // Total number of steps (5)
  formData: ApplicationFormData;   // Complete form data
  onFieldChange: (field: string, value: any) => void;  // Field change handler
  onNext: () => void;              // Next button handler
  onPrevious: () => void;          // Previous button handler
  onSave: () => void;              // Manual save handler
  errors: Record<string, string>;  // Validation errors
  isLoading: boolean;              // Loading state
  isSaving: boolean;               // Saving state
  lastSaved?: Date;                // Last save timestamp
}
```

**Usage Example:**

```jsx
import MultiStepForm from './components/applications/MultiStepForm';

function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    } else {
      setErrors(stepErrors);
    }
  };

  return (
    <MultiStepForm
      currentStep={currentStep}
      totalSteps={5}
      formData={formData}
      onFieldChange={handleFieldChange}
      onNext={handleNext}
      onPrevious={() => setCurrentStep(prev => prev - 1)}
      onSave={handleManualSave}
      errors={errors}
      isLoading={false}
      isSaving={false}
    />
  );
}
```

**Step Configuration:**

```javascript
const STEPS = [
  { 
    id: 1, 
    title: 'Personal Information', 
    component: PersonalInfoStep,
    icon: 'user'
  },
  { 
    id: 2, 
    title: 'Education & Experience', 
    component: EducationExperienceStep,
    icon: 'graduation-cap'
  },
  { 
    id: 3, 
    title: 'Skills & Languages', 
    component: SkillsLanguagesStep,
    icon: 'code'
  },
  { 
    id: 4, 
    title: 'Documents & Questions', 
    component: DocumentsQuestionsStep,
    icon: 'file'
  },
  { 
    id: 5, 
    title: 'Review & Submit', 
    component: ReviewSubmitStep,
    icon: 'check'
  }
];
```

---

### FileUploadManager

Handles multiple file uploads with drag-and-drop support.

**Location:** `frontend/src/components/applications/FileUploadManager.jsx`

**Props:**

```typescript
interface FileUploadManagerProps {
  files: UploadedFile[];           // Array of uploaded files
  maxFiles: number;                // Maximum number of files (10)
  maxSizePerFile: number;          // Max size in MB (5)
  allowedTypes: string[];          // Allowed MIME types
  onFilesChange: (files: UploadedFile[]) => void;  // Files change handler
  onUploadProgress: (fileId: string, progress: number) => void;  // Progress handler
  disabled?: boolean;              // Disable uploads
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  cloudinaryId: string;
  category: 'resume' | 'cover_letter' | 'certificate' | 'portfolio' | 'other';
  uploadedAt: Date;
}
```

**Usage Example:**

```jsx
import FileUploadManager from './components/applications/FileUploadManager';

function DocumentsStep() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleUploadProgress = (fileId, progress) => {
    setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
  };

  return (
    <FileUploadManager
      files={files}
      maxFiles={10}
      maxSizePerFile={5}
      allowedTypes={['application/pdf', 'application/msword', 'image/jpeg', 'image/png']}
      onFilesChange={handleFilesChange}
      onUploadProgress={handleUploadProgress}
    />
  );
}
```

**Key Features:**
- Drag-and-drop file upload
- Client-side validation (type, size)
- Upload progress tracking
- File categorization
- Remove uploaded files
- Visual feedback for drag state

---

### ApplicationPreview

Displays a read-only formatted view of the complete application.

**Location:** `frontend/src/components/applications/ApplicationPreview.jsx`

**Props:**

```typescript
interface ApplicationPreviewProps {
  formData: ApplicationFormData;   // Complete form data
  files: UploadedFile[];           // Uploaded files
  customAnswers: CustomQuestionAnswer[];  // Custom question answers
  onEdit: (step: number) => void;  // Edit button handler
  onSubmit: () => void;            // Submit button handler
  isSubmitting: boolean;           // Submission state
}
```

**Usage Example:**

```jsx
import ApplicationPreview from './components/applications/ApplicationPreview';

function ReviewStep({ formData, files, customAnswers }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (step) => {
    // Navigate to specific step
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitApplication(formData, files, customAnswers);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ApplicationPreview
      formData={formData}
      files={files}
      customAnswers={customAnswers}
      onEdit={handleEdit}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
```


### StatusTimeline

Visual timeline showing application status progression.

**Location:** `frontend/src/components/applications/StatusTimeline.jsx`

**Props:**

```typescript
interface StatusTimelineProps {
  currentStatus: ApplicationStatus;  // Current status
  statusHistory: StatusHistoryEntry[];  // Complete history
  compact?: boolean;                 // Compact view
}

interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: {
    id: string;
    name: string;
  };
}

type ApplicationStatus = 
  | 'Draft'
  | 'Submitted' 
  | 'Reviewed' 
  | 'Shortlisted' 
  | 'Interview Scheduled'
  | 'Accepted' 
  | 'Rejected'
  | 'Withdrawn';
```

**Usage Example:**

```jsx
import StatusTimeline from './components/applications/StatusTimeline';

function ApplicationDetails({ application }) {
  return (
    <div>
      <h2>Application Status</h2>
      <StatusTimeline
        currentStatus={application.status}
        statusHistory={application.statusHistory}
      />
    </div>
  );
}
```

**Status Colors:**
- Draft: Gray
- Submitted: Blue
- Reviewed: Blue
- Shortlisted: Green
- Interview Scheduled: Green
- Accepted: Green
- Rejected: Red
- Withdrawn: Gray

---

### AutoSaveIndicator

Shows save status and last saved time.

**Location:** `frontend/src/components/applications/AutoSaveIndicator.jsx`

**Props:**

```typescript
interface AutoSaveIndicatorProps {
  isSaving: boolean;               // Currently saving
  lastSaved?: Date;                // Last save timestamp
  error?: string;                  // Error message
}
```

**Usage Example:**

```jsx
import AutoSaveIndicator from './components/applications/AutoSaveIndicator';

function ApplicationForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);

  return (
    <div>
      <AutoSaveIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={saveError}
      />
      {/* Form content */}
    </div>
  );
}
```

**Display States:**
- Saving: "Saving..." with spinner
- Saved: "Saved at 10:30 AM" with checkmark
- Error: "Save failed" with error icon

---

## Form Step Components

### PersonalInfoStep

First step: Personal information fields.

**Location:** `frontend/src/components/applications/steps/PersonalInfoStep.jsx`

**Props:**

```typescript
interface PersonalInfoStepProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
  };
  onFieldChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}
```

**Fields:**
- Full Name (required, auto-filled from profile)
- Email (required, auto-filled from profile)
- Phone (required, auto-filled from profile)
- Country (optional, auto-filled from profile)
- City (optional, auto-filled from profile)

**Validation:**
- Full name: Required, min 3 characters
- Email: Required, valid email format
- Phone: Required, valid phone format


### EducationExperienceStep

Second step: Education and work experience.

**Props:** Similar structure with education and experience arrays

**Fields:**
- Education entries (array, min 1 required)
- Experience entries (array, optional)

### SkillsLanguagesStep

Third step: Skills and languages.

**Fields:**
- Computer skills (array)
- Software skills (array)
- Other skills (array)
- Languages (array, min 1 required)

### DocumentsQuestionsStep

Fourth step: File uploads and custom questions.

**Fields:**
- File uploads (min 1 resume required)
- Custom question answers (based on job posting)

---

## Context and State Management

### ApplicationContext

Provides application state to all child components.

**Location:** `frontend/src/context/ApplicationContext.jsx`

**Context Value:**

```typescript
interface ApplicationContextValue {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
  autoSave: () => void;
  loadDraft: () => Promise<void>;
  submitApplication: () => Promise<void>;
}

interface ApplicationState {
  currentStep: number;
  formData: ApplicationFormData;
  files: UploadedFile[];
  customAnswers: CustomQuestionAnswer[];
  isDraft: boolean;
  draftId?: string;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  lastSaved?: Date;
  errors: Record<string, string>;
}
```

**Usage:**

```jsx
import { ApplicationProvider, useApplication } from './context/ApplicationContext';

function App() {
  return (
    <ApplicationProvider jobPostingId="123">
      <ApplicationForm />
    </ApplicationProvider>
  );
}

function ApplicationForm() {
  const { state, dispatch, autoSave } = useApplication();
  
  return (
    <div>
      <p>Current Step: {state.currentStep}</p>
      <button onClick={autoSave}>Save Draft</button>
    </div>
  );
}
```

**Actions:**

```typescript
type ApplicationAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } }
  | { type: 'ADD_FILE'; payload: UploadedFile }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DRAFT'; payload: Draft }
  | { type: 'CLEAR_DRAFT' };
```

---

## Custom Hooks

### useApplicationForm

Main hook for form management.

**Location:** `frontend/src/hooks/useApplicationForm.js`

**Returns:**

```typescript
interface UseApplicationFormReturn {
  formData: ApplicationFormData;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
}
```

**Usage:**

```jsx
import { useApplicationForm } from './hooks/useApplicationForm';

function MyForm() {
  const { formData, errors, updateField, validateStep } = useApplicationForm();
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  return (
    <input
      value={formData.fullName}
      onChange={(e) => updateField('fullName', e.target.value)}
      error={errors.fullName}
    />
  );
}
```


### useAutoSave

Hook for auto-save functionality with debouncing.

**Location:** `frontend/src/hooks/useAutoSave.js`

**Parameters:**

```typescript
interface UseAutoSaveParams {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;  // Default: 3000ms
  enabled?: boolean;  // Default: true
}
```

**Returns:**

```typescript
interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  forceSave: () => Promise<void>;
}
```

**Usage:**

```jsx
import { useAutoSave } from './hooks/useAutoSave';

function ApplicationForm() {
  const [formData, setFormData] = useState({});
  
  const saveDraft = async (data) => {
    await fetch('/api/applications/drafts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
  
  const { isSaving, lastSaved, forceSave } = useAutoSave({
    data: formData,
    onSave: saveDraft,
    delay: 3000
  });
  
  return (
    <div>
      {isSaving && <p>Saving...</p>}
      {lastSaved && <p>Last saved: {lastSaved.toLocaleTimeString()}</p>}
      <button onClick={forceSave}>Save Now</button>
    </div>
  );
}
```

---

### useFileUpload

Hook for file upload management.

**Location:** `frontend/src/hooks/useFileUpload.js`

**Returns:**

```typescript
interface UseFileUploadReturn {
  uploadFile: (file: File, category: string) => Promise<UploadedFile>;
  deleteFile: (cloudinaryId: string) => Promise<void>;
  uploadProgress: Record<string, number>;
  isUploading: boolean;
}
```

**Usage:**

```jsx
import { useFileUpload } from './hooks/useFileUpload';

function FileUpload() {
  const { uploadFile, deleteFile, uploadProgress, isUploading } = useFileUpload();
  
  const handleFileSelect = async (file) => {
    try {
      const uploadedFile = await uploadFile(file, 'resume');
      console.log('Uploaded:', uploadedFile);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
      {isUploading && <p>Uploading... {uploadProgress['file_id']}%</p>}
    </div>
  );
}
```

---

### usePusherSubscription

Hook for real-time status updates via Pusher.

**Location:** `frontend/src/hooks/usePusherSubscription.js`

**Parameters:**

```typescript
interface UsePusherSubscriptionParams {
  channel: string;
  event: string;
  onMessage: (data: any) => void;
}
```

**Usage:**

```jsx
import { usePusherSubscription } from './hooks/usePusherSubscription';

function ApplicationStatus({ applicationId }) {
  const [status, setStatus] = useState('Submitted');
  
  usePusherSubscription({
    channel: `application-${applicationId}`,
    event: 'status-updated',
    onMessage: (data) => {
      setStatus(data.newStatus);
      // Show notification
    }
  });
  
  return <p>Status: {status}</p>;
}
```

---

## Usage Examples

### Complete Application Flow

```jsx
import React from 'react';
import { ApplicationProvider } from './context/ApplicationContext';
import ApplicationFormContainer from './components/applications/ApplicationFormContainer';

function ApplyPage({ jobId }) {
  const navigate = useNavigate();
  
  return (
    <ApplicationProvider jobPostingId={jobId}>
      <ApplicationFormContainer
        jobPostingId={jobId}
        onSubmitSuccess={(applicationId) => {
          navigate(`/applications/${applicationId}`);
        }}
        onCancel={() => {
          navigate('/job-postings');
        }}
      />
    </ApplicationProvider>
  );
}
```

### Custom Form with Auto-Save

```jsx
import { useState } from 'react';
import { useAutoSave } from './hooks/useAutoSave';
import { useApplicationForm } from './hooks/useApplicationForm';

function CustomApplicationForm() {
  const { formData, updateField, validateStep } = useApplicationForm();
  const [currentStep, setCurrentStep] = useState(1);
  
  const saveDraft = async (data) => {
    const response = await fetch('/api/applications/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, step: currentStep })
    });
    return response.json();
  };
  
  const { isSaving, lastSaved } = useAutoSave({
    data: formData,
    onSave: saveDraft,
    delay: 3000
  });
  
  return (
    <div>
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      <input
        value={formData.fullName}
        onChange={(e) => updateField('fullName', e.target.value)}
      />
      <button onClick={() => validateStep(currentStep) && setCurrentStep(2)}>
        Next
      </button>
    </div>
  );
}
```

---

## Styling Guidelines

All components use Tailwind CSS with the Careerak color palette:

**Colors:**
- Primary (كحلي): `#304B60`
- Secondary (بيج): `#E3DAD1`
- Accent (نحاسي): `#D48161`
- Input borders: `#D4816180` (always, all states)

**Fonts:**
- Arabic: Amiri, Cairo
- English: Cormorant Garamond
- French: EB Garamond

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: >= 1024px

**Example Component Styling:**

```jsx
<div className="max-w-4xl mx-auto p-6">
  <input
    className="w-full px-4 py-2 border-2 rounded-lg
               border-[#D4816180] focus:border-[#D4816180]
               text-base font-inherit"
    style={{ fontFamily: 'inherit' }}
  />
</div>
```

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- Color contrast ratios >= 4.5:1
- Touch targets >= 44x44px

**Example:**

```jsx
<button
  aria-label="Upload resume"
  className="min-h-[44px] min-w-[44px]"
  onClick={handleUpload}
>
  Upload
</button>
```

---

## Testing Components

### Unit Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoStep from './PersonalInfoStep';

test('validates required fields', () => {
  const onFieldChange = jest.fn();
  const errors = {};
  
  render(
    <PersonalInfoStep
      formData={{ fullName: '', email: '', phone: '' }}
      onFieldChange={onFieldChange}
      errors={errors}
    />
  );
  
  const nameInput = screen.getByLabelText('Full Name');
  fireEvent.change(nameInput, { target: { value: 'Ahmed' } });
  
  expect(onFieldChange).toHaveBeenCalledWith('fullName', 'Ahmed');
});
```

### Integration Test Example

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationFormContainer from './ApplicationFormContainer';

test('complete application flow', async () => {
  const onSubmitSuccess = jest.fn();
  
  render(
    <ApplicationFormContainer
      jobPostingId="123"
      onSubmitSuccess={onSubmitSuccess}
      onCancel={() => {}}
    />
  );
  
  // Fill step 1
  await userEvent.type(screen.getByLabelText('Full Name'), 'Ahmed Hassan');
  await userEvent.click(screen.getByText('Next'));
  
  // Continue through steps...
  
  // Submit
  await userEvent.click(screen.getByText('Submit Application'));
  
  await waitFor(() => {
    expect(onSubmitSuccess).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization

### Memoization

```jsx
import { memo, useMemo, useCallback } from 'react';

const PersonalInfoStep = memo(({ formData, onFieldChange, errors }) => {
  const handleChange = useCallback((field) => (e) => {
    onFieldChange(field, e.target.value);
  }, [onFieldChange]);
  
  return (
    <input
      value={formData.fullName}
      onChange={handleChange('fullName')}
    />
  );
});
```

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const ApplicationPreview = lazy(() => 
  import('./components/applications/ApplicationPreview')
);

function ReviewStep() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApplicationPreview {...props} />
    </Suspense>
  );
}
```

---

## Troubleshooting

### Common Issues

**Auto-save not working:**
- Check network connection
- Verify authentication token
- Check browser console for errors
- Ensure debounce delay is appropriate

**File upload fails:**
- Verify file type and size
- Check Cloudinary credentials
- Ensure CORS is configured
- Check network tab for errors

**Status updates not real-time:**
- Verify Pusher credentials
- Check Pusher connection status
- Ensure correct channel subscription
- Check browser console for Pusher errors

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [User Guide](./USER_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
