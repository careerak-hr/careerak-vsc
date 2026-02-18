# Design Document: Apply Page Enhancements

## Overview

The Apply Page Enhancements feature transforms the job application experience in Careerak from a single-page, manual data entry process into an intelligent, multi-step workflow with auto-fill, draft management, and real-time feedback. The design leverages existing User Profile data, integrates with Cloudinary for file management, uses Pusher for real-time updates, and implements a robust auto-save mechanism to prevent data loss.

### Key Design Goals

1. **Reduce Friction**: Auto-fill from profile data to minimize manual entry
2. **Prevent Data Loss**: Auto-save and manual save with local storage fallback
3. **Improve Clarity**: Multi-step form with clear progress indication
4. **Enhance Confidence**: Preview before submission with easy editing
5. **Support Flexibility**: Custom company questions and multiple file uploads
6. **Ensure Reliability**: Offline-capable with synchronization on reconnection

### Technology Stack

- **Frontend**: React with functional components and hooks
- **State Management**: React Context API + useReducer for complex form state
- **File Upload**: Cloudinary SDK with drag-and-drop support
- **Real-time**: Pusher for status updates
- **Persistence**: MongoDB for backend, LocalStorage for offline backup
- **Validation**: Yup schema validation
- **UI Framework**: Tailwind CSS with custom components

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Application  │  │ Multi-Step   │  │ File Upload  │     │
│  │ Form Manager │  │ Form UI      │  │ Component    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Application Context & State Manager        │    │
│  └──────┬─────────────────────────────────────────────┘    │
│         │                                                    │
├─────────┼────────────────────────────────────────────────────┤
│         │              Service Layer                         │
├─────────┼────────────────────────────────────────────────────┤
│  ┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auto-Save    │  │ Draft        │  │ Sync         │     │
│  │ Service      │  │ Manager      │  │ Service      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
├─────────┼──────────────────┼──────────────────┼──────────────┤
│         │         Backend API Layer           │              │
├─────────┼──────────────────┼──────────────────┼──────────────┤
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Application Controller                      │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Application  │  │ Notification │  │ Pusher       │     │
│  │ Service      │  │ Service      │  │ Service      │     │
│  └──────┬───────┘  └──────────────┘  └──────────────┘     │
│         │                                                    │
├─────────┼────────────────────────────────────────────────────┤
│         │           External Services                        │
├─────────┼────────────────────────────────────────────────────┤
│  ┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ MongoDB      │  │ Cloudinary   │  │ Pusher       │     │
│  │ Database     │  │ File Storage │  │ Real-time    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Application Initialization**:
   - User navigates to job application page
   - System loads User Profile data
   - System checks for existing draft
   - Auto-fill populates form fields
   - Form renders at appropriate step

2. **User Interaction**:
   - User modifies form fields
   - Inline validation provides immediate feedback
   - Auto-save triggers after 3 seconds of inactivity
   - Draft saved to backend and confirmed to user

3. **File Upload**:
   - User drags/selects files
   - Client-side validation (type, size)
   - Upload to Cloudinary with progress tracking
   - File reference stored in application data

4. **Form Navigation**:
   - User clicks next/previous
   - Current step validated (on next only)
   - State preserved across navigation
   - Progress indicator updated

5. **Preview & Submit**:
   - User completes all steps
   - Preview displays formatted application
   - User confirms and submits
   - Backend processes application
   - Notification sent to employer
   - Draft deleted
   - Success confirmation displayed

6. **Status Updates**:
   - Employer updates application status
   - Backend triggers notification
   - Pusher sends real-time update
   - Frontend updates status timeline
   - User sees updated status immediately

## Components and Interfaces

### Frontend Components

#### 1. ApplicationFormContainer

Main container component managing the entire application flow.

```typescript
interface ApplicationFormContainerProps {
  jobPostingId: string;
  onSubmitSuccess: (applicationId: string) => void;
  onCancel: () => void;
}

interface ApplicationFormState {
  currentStep: number;
  formData: ApplicationFormData;
  isDraft: boolean;
  draftId?: string;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  errors: Record<string, string>;
}
```

#### 2. MultiStepForm

Renders the current step and manages navigation.

```typescript
interface MultiStepFormProps {
  currentStep: number;
  totalSteps: number;
  formData: ApplicationFormData;
  onFieldChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
  errors: Record<string, string>;
}

const STEPS = [
  { id: 1, title: 'Personal Information', component: PersonalInfoStep },
  { id: 2, title: 'Education & Experience', component: EducationExperienceStep },
  { id: 3, title: 'Skills & Languages', component: SkillsLanguagesStep },
  { id: 4, title: 'Documents & Questions', component: DocumentsQuestionsStep },
  { id: 5, title: 'Review & Submit', component: ReviewSubmitStep }
];
```

#### 3. FileUploadManager

Handles multiple file uploads with drag-and-drop.

```typescript
interface FileUploadManagerProps {
  files: UploadedFile[];
  maxFiles: number;
  maxSizePerFile: number; // in MB
  allowedTypes: string[];
  onFilesChange: (files: UploadedFile[]) => void;
  onUploadProgress: (fileId: string, progress: number) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  cloudinaryId: string;
  uploadedAt: Date;
}
```

#### 4. ApplicationPreview

Displays read-only formatted view of complete application.

```typescript
interface ApplicationPreviewProps {
  formData: ApplicationFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}
```

#### 5. StatusTimeline

Visual timeline showing application status progression.

```typescript
interface StatusTimelineProps {
  currentStatus: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
}

interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: Date;
  note?: string;
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

#### 6. AutoSaveIndicator

Shows save status and last saved time.

```typescript
interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
}
```

### Backend API Endpoints

#### Draft Management

```typescript
// Create or update draft
POST /api/applications/drafts
Request: {
  jobPostingId: string;
  step: number;
  formData: Partial<ApplicationFormData>;
  files: FileReference[];
}
Response: {
  draftId: string;
  savedAt: Date;
}

// Get draft
GET /api/applications/drafts/:jobPostingId
Response: {
  draftId: string;
  step: number;
  formData: Partial<ApplicationFormData>;
  files: FileReference[];
  savedAt: Date;
}

// Delete draft
DELETE /api/applications/drafts/:draftId
Response: { success: boolean }
```

#### Application Submission

```typescript
// Submit application
POST /api/applications
Request: {
  jobPostingId: string;
  formData: ApplicationFormData;
  files: FileReference[];
  customAnswers: CustomQuestionAnswer[];
}
Response: {
  applicationId: string;
  status: 'Submitted';
  submittedAt: Date;
}

// Get application details
GET /api/applications/:applicationId
Response: {
  applicationId: string;
  jobPosting: JobPostingReference;
  applicant: UserReference;
  formData: ApplicationFormData;
  files: FileReference[];
  customAnswers: CustomQuestionAnswer[];
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  submittedAt: Date;
}

// Withdraw application
PATCH /api/applications/:applicationId/withdraw
Response: {
  applicationId: string;
  status: 'Withdrawn';
  withdrawnAt: Date;
}
```

#### Status Updates

```typescript
// Update application status (HR only)
PATCH /api/applications/:applicationId/status
Request: {
  status: ApplicationStatus;
  note?: string;
}
Response: {
  applicationId: string;
  status: ApplicationStatus;
  updatedAt: Date;
}
```

### Services

#### AutoSaveService

```typescript
class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 3000; // 3 seconds
  
  scheduleSave(
    draftId: string | undefined,
    jobPostingId: string,
    formData: Partial<ApplicationFormData>,
    onSaveComplete: (draftId: string) => void,
    onSaveError: (error: Error) => void
  ): void;
  
  cancelScheduledSave(): void;
  
  forceSave(
    draftId: string | undefined,
    jobPostingId: string,
    formData: Partial<ApplicationFormData>
  ): Promise<string>;
}
```

#### DraftManager

```typescript
class DraftManager {
  // Save to backend
  async saveDraft(
    draftId: string | undefined,
    jobPostingId: string,
    step: number,
    formData: Partial<ApplicationFormData>,
    files: FileReference[]
  ): Promise<string>;
  
  // Load from backend
  async loadDraft(jobPostingId: string): Promise<Draft | null>;
  
  // Delete draft
  async deleteDraft(draftId: string): Promise<void>;
  
  // Save to local storage (fallback)
  saveToLocalStorage(
    jobPostingId: string,
    draft: Draft
  ): void;
  
  // Load from local storage
  loadFromLocalStorage(jobPostingId: string): Draft | null;
  
  // Clear local storage
  clearLocalStorage(jobPostingId: string): void;
}
```

#### SyncService

```typescript
class SyncService {
  // Check for conflicts between backend and local storage
  async resolveConflicts(
    jobPostingId: string
  ): Promise<Draft>;
  
  // Sync local storage to backend when connection restored
  async syncToBackend(
    jobPostingId: string,
    localDraft: Draft
  ): Promise<void>;
  
  // Monitor connection status
  onConnectionRestored(callback: () => void): void;
}
```

#### FileUploadService

```typescript
class FileUploadService {
  async uploadFile(
    file: File,
    onProgress: (progress: number) => void
  ): Promise<UploadedFile>;
  
  async deleteFile(cloudinaryId: string): Promise<void>;
  
  validateFile(file: File): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

## Data Models

### ApplicationDraft Schema

```typescript
const applicationDraftSchema = new mongoose.Schema({
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  step: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  formData: {
    // Personal Information
    fullName: String,
    email: String,
    phone: String,
    country: String,
    city: String,
    
    // Education
    education: [{
      level: String,
      degree: String,
      institution: String,
      city: String,
      country: String,
      year: String,
      grade: String
    }],
    
    // Experience
    experience: [{
      company: String,
      position: String,
      from: Date,
      to: Date,
      current: Boolean,
      tasks: String,
      workType: String,
      jobLevel: String,
      country: String,
      city: String
    }],
    
    // Skills
    computerSkills: [{
      skill: String,
      proficiency: String
    }],
    softwareSkills: [{
      software: String,
      proficiency: String
    }],
    otherSkills: [String],
    
    // Languages
    languages: [{
      language: String,
      proficiency: String
    }],
    
    // Additional
    coverLetter: String,
    expectedSalary: Number,
    availableFrom: Date,
    noticePeriod: String
  },
  files: [{
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    cloudinaryId: String,
    category: {
      type: String,
      enum: ['resume', 'cover_letter', 'certificate', 'portfolio', 'other']
    },
    uploadedAt: Date
  }],
  customAnswers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  lastSaved: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
applicationDraftSchema.index({ applicant: 1, jobPosting: 1 }, { unique: true });
```

### Enhanced JobApplication Schema

```typescript
const jobApplicationSchema = new mongoose.Schema({
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Personal Information
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: String,
  city: String,
  
  // Education (from profile or manual entry)
  education: [{
    level: String,
    degree: String,
    institution: String,
    city: String,
    country: String,
    year: String,
    grade: String
  }],
  
  // Experience (from profile or manual entry)
  experience: [{
    company: String,
    position: String,
    from: Date,
    to: Date,
    current: Boolean,
    tasks: String,
    workType: String,
    jobLevel: String,
    country: String,
    city: String
  }],
  
  // Skills
  computerSkills: [{
    skill: String,
    proficiency: String
  }],
  softwareSkills: [{
    software: String,
    proficiency: String
  }],
  otherSkills: [String],
  
  // Languages
  languages: [{
    language: String,
    proficiency: String
  }],
  
  // Files
  files: [{
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    cloudinaryId: String,
    category: String,
    uploadedAt: Date
  }],
  
  // Additional Information
  coverLetter: String,
  expectedSalary: Number,
  availableFrom: Date,
  noticePeriod: String,
  
  // Custom Questions
  customAnswers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  
  // Status Management
  status: {
    type: String,
    enum: ['Submitted', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected', 'Withdrawn'],
    default: 'Submitted',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  withdrawnAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
jobApplicationSchema.index({ applicant: 1, status: 1 });
jobApplicationSchema.index({ jobPosting: 1, status: 1 });
jobApplicationSchema.index({ submittedAt: -1 });
```

### Enhanced JobPosting Schema (Custom Questions)

```typescript
// Add to existing JobPosting schema
const customQuestionsField = {
  customQuestions: [{
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    questionText: {
      type: String,
      required: true,
      maxlength: 500
    },
    questionType: {
      type: String,
      enum: ['short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no'],
      required: true
    },
    options: [String], // For single_choice and multiple_choice
    required: {
      type: Boolean,
      default: false
    },
    order: Number
  }]
};
```

### LocalStorage Data Structure

```typescript
interface LocalStorageDraft {
  jobPostingId: string;
  draftId?: string;
  step: number;
  formData: Partial<ApplicationFormData>;
  files: FileReference[];
  lastSaved: string; // ISO date string
  version: number; // For conflict resolution
}

// Storage key format: `careerak_draft_${jobPostingId}`
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundancies Eliminated:**
- Properties 1.2, 1.3, 1.4, 1.5 (individual data type transfers) → Consolidated into Property 1 (comprehensive auto-fill)
- Properties 3.2 and 3.3 (preview display completeness) → Consolidated into Property 3
- Properties 2.3 and 2.4 (save and load) → Consolidated into Property 2 (round-trip)
- Properties 4.3 and 4.4 (file type and size validation) → Consolidated into Property 4 (file validation)
- Properties 5.4 and 5.5 (notification and Pusher) → Consolidated into Property 8 (status change notifications)
- Properties 6.3 and 6.6 (withdrawal status update and timeline) → Consolidated into Property 10 (withdrawal)

**Properties Retained:**
- Each remaining property provides unique validation value
- Properties cover different aspects: data transfer, persistence, validation, navigation, status management
- Edge cases marked separately for generator handling

### Correctness Properties

Property 1: Auto-fill completeness
*For any* authenticated user with a profile containing data (education, experience, skills, languages), when opening an application form, all profile data should be correctly transferred to the corresponding form fields, and the count of entries in each section should match the profile.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

Property 2: Draft round-trip preservation
*For any* draft application data including step number, form fields, and file references, saving the draft and then loading it should produce equivalent data with all fields, files, and step position preserved.
**Validates: Requirements 2.3, 2.4, 4.10**

Property 3: User modifications persistence
*For any* form field that has been auto-filled from profile data, if the user modifies the field value, subsequent operations (navigation, save/load, preview) should preserve the user's modified value and never revert to the original profile value.
**Validates: Requirements 1.6, 7.7**

Property 4: File validation correctness
*For any* file upload attempt, the system should correctly accept files that meet all criteria (type in [PDF, DOC, DOCX, JPG, PNG] AND size ≤ 5MB) and reject files that fail any criterion, displaying an appropriate error message indicating the specific validation failure.
**Validates: Requirements 4.3, 4.4, 4.5**

Property 5: Draft deletion after submission
*For any* draft application, when the final application is successfully submitted, the corresponding draft should no longer exist in either backend storage or local storage.
**Validates: Requirements 2.7**

Property 6: Auto-save retry on failure
*For any* auto-save operation that fails due to network issues, the system should queue the operation and successfully save to backend when connection is restored, ensuring no data loss.
**Validates: Requirements 2.6, 11.2, 11.3**

Property 7: Step validation enforcement
*For any* form step with incomplete required fields, clicking the next button should prevent navigation to the next step, display error messages for all invalid fields, and keep the user on the current step.
**Validates: Requirements 7.4, 7.5**

Property 8: Status change notifications
*For any* application status change, the system should send both a notification through the Notification_Service and a real-time update through Pusher_Service to the applicant.
**Validates: Requirements 5.4, 5.5**

Property 9: Withdrawal restrictions
*For any* application with status in [Shortlisted, Interview Scheduled, Accepted, Rejected], the system should not display a withdraw button and should reject any withdrawal attempts.
**Validates: Requirements 6.1, 6.5**

Property 10: Withdrawal completeness
*For any* withdrawable application (status Pending or Reviewed), when withdrawal is confirmed, the system should update status to Withdrawn, add an entry to the status timeline with timestamp, and send a notification to the employer.
**Validates: Requirements 6.3, 6.4, 6.6**

Property 11: Preview data completeness
*For any* completed application form, the preview should display all entered data including personal information, all education entries, all experience entries, all skills, all uploaded files, and all custom question answers, with no data omitted.
**Validates: Requirements 3.2, 3.3**

Property 12: Navigation data preservation
*For any* form data entered across multiple steps, navigating forward and backward between steps (including to preview and back) should preserve all entered data without loss or modification.
**Validates: Requirements 3.5, 7.7**

Property 13: Custom question validation
*For any* custom question marked as required, the system should prevent form submission if the question is unanswered, displaying an appropriate error message.
**Validates: Requirements 8.3**

Property 14: Custom answer persistence
*For any* custom question answer provided by an applicant, the answer should be stored with the application data and correctly displayed to the employer when viewing the application.
**Validates: Requirements 8.6**

Property 15: File removal completeness
*For any* uploaded file, when the user removes it, the file should be deleted from Cloudinary storage, removed from the application data, and no longer appear in the file list.
**Validates: Requirements 4.9**

Property 16: Conflict resolution by timestamp
*For any* situation where both backend draft and local storage backup exist, the system should automatically select the version with the most recent timestamp for restoration.
**Validates: Requirements 11.6**

Property 17: Local storage synchronization
*For any* draft data saved to local storage as a backup, when connection is restored and synchronization completes successfully, the local storage backup should be cleared.
**Validates: Requirements 11.3, 11.4**

Property 18: Backward navigation without validation
*For any* form step, clicking the previous button should navigate to the previous step without performing validation, regardless of whether the current step has validation errors.
**Validates: Requirements 7.6**

Property 19: Progress indicator accuracy
*For any* form step the user is on, the progress indicator should correctly show the current step number, mark all previous steps as completed, and show remaining steps as incomplete.
**Validates: Requirements 7.2**

Property 20: Status timeline accuracy
*For any* application with status history, the status timeline should display all status changes in chronological order with accurate timestamps for each transition.
**Validates: Requirements 5.2, 5.3**

Property 21: Empty profile field handling
*For any* user profile with missing or empty fields, opening the application form should leave the corresponding form fields empty without errors, allowing manual entry.
**Validates: Requirements 1.7**

Property 22: Validation feedback consistency
*For any* required field that is empty or invalid, the system should display an error message, and for any required field that is valid and complete, the system should display a success indicator.
**Validates: Requirements 9.2, 9.3**

Property 23: Error message clarity
*For any* error condition (validation failure, network error, file upload error), the system should display a user-friendly error message that explains the problem and suggests corrective action.
**Validates: Requirements 9.6**

Property 24: Backend persistence
*For any* draft save operation that succeeds, the draft data should be stored in the backend database and retrievable in subsequent sessions.
**Validates: Requirements 11.1**

Property 25: Dual source checking
*For any* application form load, the system should check both backend database and local storage for draft data before initializing the form.
**Validates: Requirements 11.5**

## Error Handling

### Client-Side Error Handling

1. **Network Failures**
   - Auto-save failures trigger local storage backup
   - Queue failed operations for retry
   - Display offline indicator to user
   - Sync when connection restored

2. **Validation Errors**
   - Inline validation with immediate feedback
   - Prevent navigation on validation failure
   - Clear, specific error messages
   - Highlight invalid fields

3. **File Upload Errors**
   - Validate before upload (type, size)
   - Handle upload failures gracefully
   - Allow retry for failed uploads
   - Display progress and errors clearly

4. **State Management Errors**
   - Catch and log state update errors
   - Prevent app crashes
   - Maintain last known good state
   - Provide recovery options

### Backend Error Handling

1. **Database Errors**
   - Wrap all DB operations in try-catch
   - Return appropriate HTTP status codes
   - Log errors for debugging
   - Provide meaningful error messages

2. **File Storage Errors**
   - Handle Cloudinary API failures
   - Implement retry logic
   - Clean up orphaned files
   - Validate file operations

3. **Validation Errors**
   - Validate all input data
   - Return detailed validation errors
   - Prevent invalid data persistence
   - Sanitize user input

4. **Concurrency Errors**
   - Handle race conditions in draft updates
   - Use optimistic locking where needed
   - Resolve conflicts gracefully
   - Prevent data corruption

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string; // For validation errors
  };
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using fast-check
- Both are complementary and necessary for comprehensive coverage

### Property-Based Testing

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: apply-page-enhancements, Property {number}: {property_text}`

**Test Categories**:

1. **Data Transfer Properties** (Properties 1, 3, 21)
   - Generate random user profiles with varying completeness
   - Verify auto-fill correctness
   - Test modification persistence
   - Test empty field handling

2. **Persistence Properties** (Properties 2, 5, 17, 24, 25)
   - Generate random draft data
   - Test save/load round-trips
   - Test deletion after submission
   - Test dual source checking
   - Test synchronization

3. **Validation Properties** (Properties 4, 7, 13, 22)
   - Generate random files (valid and invalid)
   - Generate random form data (complete and incomplete)
   - Test validation logic
   - Test error messaging

4. **Navigation Properties** (Properties 12, 18, 19)
   - Generate random form states
   - Test navigation preservation
   - Test backward navigation
   - Test progress indicator

5. **Status Management Properties** (Properties 8, 9, 10, 20)
   - Generate random status transitions
   - Test notification sending
   - Test withdrawal restrictions
   - Test timeline accuracy

6. **File Management Properties** (Properties 15)
   - Generate random file sets
   - Test upload and removal
   - Test Cloudinary integration

7. **Conflict Resolution Properties** (Properties 6, 16)
   - Generate conflicting drafts
   - Test timestamp-based resolution
   - Test retry logic

### Unit Testing

**Focus Areas**:

1. **Component Tests**
   - MultiStepForm navigation
   - FileUploadManager UI interactions
   - StatusTimeline rendering
   - ApplicationPreview display

2. **Service Tests**
   - AutoSaveService timing and debouncing
   - DraftManager CRUD operations
   - SyncService conflict resolution
   - FileUploadService Cloudinary integration

3. **Integration Tests**
   - Complete application submission flow
   - Draft save and restore flow
   - File upload and removal flow
   - Status update and notification flow

4. **Edge Cases**
   - Maximum file count (10 files)
   - Maximum custom questions (5 questions)
   - Empty profile data
   - Network disconnection during save
   - Concurrent draft updates

5. **Error Conditions**
   - Invalid file types
   - Oversized files
   - Network failures
   - Validation failures
   - Backend errors

### Test Data Generators

```typescript
// fast-check generators for property tests

const userProfileArbitrary = fc.record({
  firstName: fc.string(),
  lastName: fc.string(),
  email: fc.emailAddress(),
  phone: fc.string(),
  education: fc.array(fc.record({
    level: fc.string(),
    degree: fc.string(),
    institution: fc.string(),
    year: fc.string()
  }), { maxLength: 10 }),
  experience: fc.array(fc.record({
    company: fc.string(),
    position: fc.string(),
    from: fc.date(),
    to: fc.date()
  }), { maxLength: 10 }),
  computerSkills: fc.array(fc.record({
    skill: fc.string(),
    proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
  }), { maxLength: 20 }),
  languages: fc.array(fc.record({
    language: fc.string(),
    proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native')
  }), { maxLength: 10 })
});

const draftDataArbitrary = fc.record({
  step: fc.integer({ min: 1, max: 5 }),
  formData: fc.record({
    fullName: fc.string(),
    email: fc.emailAddress(),
    phone: fc.string(),
    education: fc.array(fc.object(), { maxLength: 10 }),
    experience: fc.array(fc.object(), { maxLength: 10 }),
    skills: fc.array(fc.string(), { maxLength: 20 })
  }),
  files: fc.array(fc.record({
    id: fc.uuid(),
    name: fc.string(),
    size: fc.integer({ min: 1, max: 5000000 }),
    type: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),
    url: fc.webUrl()
  }), { maxLength: 10 })
});

const fileArbitrary = fc.record({
  name: fc.string(),
  size: fc.integer({ min: 1, max: 10000000 }),
  type: fc.constantFrom(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain', // invalid
    'video/mp4'   // invalid
  )
});

const applicationStatusArbitrary = fc.constantFrom(
  'Submitted',
  'Reviewed',
  'Shortlisted',
  'Interview Scheduled',
  'Accepted',
  'Rejected',
  'Withdrawn'
);
```

### Testing Checklist

Before deployment, ensure:

- [ ] All 25 property tests pass with 100+ iterations
- [ ] All unit tests pass
- [ ] Integration tests cover complete flows
- [ ] Edge cases tested (max files, max questions, empty data)
- [ ] Error conditions tested (network failures, validation errors)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing (iOS, Android)
- [ ] RTL layout testing (Arabic language)
- [ ] Performance testing (load times, save times)
- [ ] Accessibility testing (keyboard navigation, screen readers)
- [ ] Cloudinary integration tested
- [ ] Pusher integration tested
- [ ] Notification system integration tested
