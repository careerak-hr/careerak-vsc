# Implementation Plan: Apply Page Enhancements

## Overview

This implementation plan breaks down the Apply Page Enhancements feature into discrete, manageable coding tasks. The approach follows an incremental development strategy: build core infrastructure first, then add features layer by layer, with testing integrated throughout. Each task builds on previous work, ensuring no orphaned code.

## Tasks

- [ ] 1. Set up data models and database schemas
  - Create ApplicationDraft model with all required fields (step, formData, files, customAnswers)
  - Enhance JobApplication model with new fields (education array, experience array, skills, languages, files array, customAnswers, statusHistory)
  - Add customQuestions field to JobPosting model
  - Create database indexes for efficient queries (applicant+jobPosting, status, submittedAt)
  - _Requirements: 1.1, 2.3, 4.10, 8.1, 11.1_

- [ ] 2. Implement backend draft management API
  - [ ] 2.1 Create draft controller with CRUD operations
    - POST /api/applications/drafts - create/update draft
    - GET /api/applications/drafts/:jobPostingId - retrieve draft
    - DELETE /api/applications/drafts/:draftId - delete draft
    - Implement authentication middleware
    - Add validation for draft data
    - _Requirements: 2.1, 2.2, 2.3, 11.1_
  
  - [ ]* 2.2 Write property test for draft round-trip
    - **Property 2: Draft round-trip preservation**
    - **Validates: Requirements 2.3, 2.4, 4.10**
    - Generate random draft data (step, formData, files)
    - Save draft and retrieve it
    - Verify all fields match original data
  
  - [ ]* 2.3 Write unit tests for draft controller
    - Test create draft with valid data
    - Test update existing draft
    - Test retrieve non-existent draft
    - Test delete draft
    - Test authentication failures
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Implement backend application submission API
  - [ ] 3.1 Create application controller with submission endpoint
    - POST /api/applications - submit final application
    - GET /api/applications/:applicationId - retrieve application
    - PATCH /api/applications/:applicationId/withdraw - withdraw application
    - PATCH /api/applications/:applicationId/status - update status (HR only)
    - Implement role-based authorization
    - Add comprehensive validation
    - _Requirements: 2.7, 5.1, 6.1, 6.3_
  
  - [ ]* 3.2 Write property test for draft deletion after submission
    - **Property 5: Draft deletion after submission**
    - **Validates: Requirements 2.7**
    - Generate random draft
    - Submit application
    - Verify draft no longer exists in database
  
  - [ ]* 3.3 Write property test for withdrawal restrictions
    - **Property 9: Withdrawal restrictions**
    - **Validates: Requirements 6.1, 6.5**
    - Generate applications with various statuses
    - Verify withdrawal allowed only for Pending/Reviewed
    - Verify withdrawal rejected for Shortlisted/Accepted/Rejected
  
  - [ ]* 3.4 Write unit tests for application controller
    - Test successful submission
    - Test submission with invalid data
    - Test withdrawal flow
    - Test status updates
    - Test authorization checks
    - _Requirements: 2.7, 6.1, 6.3, 6.5_

- [ ] 4. Integrate Cloudinary file upload service
  - [ ] 4.1 Set up Cloudinary configuration and service
    - Configure Cloudinary credentials
    - Create FileUploadService class
    - Implement uploadFile method with progress tracking
    - Implement deleteFile method
    - Implement validateFile method (type, size)
    - Add error handling and retry logic
    - _Requirements: 4.3, 4.4, 4.6, 4.9_
  
  - [ ]* 4.2 Write property test for file validation
    - **Property 4: File validation correctness**
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - Generate random files with various types and sizes
    - Verify valid files accepted (PDF, DOC, DOCX, JPG, PNG, ≤5MB)
    - Verify invalid files rejected with appropriate error
  
  - [ ]* 4.3 Write property test for file removal
    - **Property 15: File removal completeness**
    - **Validates: Requirements 4.9**
    - Upload random files
    - Remove files
    - Verify files deleted from Cloudinary
    - Verify files removed from application data
  
  - [ ]* 4.4 Write unit tests for file upload service
    - Test successful upload
    - Test upload failure handling
    - Test file deletion
    - Test validation edge cases
    - _Requirements: 4.3, 4.4, 4.6, 4.9_

- [ ] 5. Checkpoint - Backend APIs complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create frontend state management infrastructure
  - [ ] 6.1 Create ApplicationContext with useReducer
    - Define ApplicationFormState interface
    - Define action types (SET_FIELD, SET_STEP, SET_FILES, SET_ERRORS, etc.)
    - Implement reducer function
    - Create context provider component
    - Create custom hooks (useApplicationForm, useAutoSave)
    - _Requirements: 2.1, 7.1, 7.7_
  
  - [ ]* 6.2 Write property test for navigation data preservation
    - **Property 12: Navigation data preservation**
    - **Validates: Requirements 3.5, 7.7**
    - Generate random form data across multiple steps
    - Simulate navigation forward and backward
    - Verify all data preserved without loss
  
  - [ ]* 6.3 Write unit tests for state management
    - Test reducer actions
    - Test state updates
    - Test context provider
    - _Requirements: 7.7_

- [ ] 7. Implement auto-save functionality
  - [ ] 7.1 Create AutoSaveService class
    - Implement debounced save (3 second delay)
    - Implement forceSave for manual save
    - Implement cancelScheduledSave
    - Add network failure detection
    - Implement local storage fallback
    - _Requirements: 2.1, 2.6, 11.2_
  
  - [ ] 7.2 Create DraftManager class
    - Implement saveDraft (backend API call)
    - Implement loadDraft (backend API call)
    - Implement deleteDraft (backend API call)
    - Implement saveToLocalStorage
    - Implement loadFromLocalStorage
    - Implement clearLocalStorage
    - _Requirements: 2.3, 2.4, 11.1, 11.2_
  
  - [ ] 7.3 Create SyncService class
    - Implement resolveConflicts (timestamp-based)
    - Implement syncToBackend
    - Implement connection monitoring
    - Add retry queue for failed saves
    - _Requirements: 2.6, 11.3, 11.4, 11.6_
  
  - [ ]* 7.4 Write property test for auto-save retry
    - **Property 6: Auto-save retry on failure**
    - **Validates: Requirements 2.6, 11.2, 11.3**
    - Simulate network failure during save
    - Verify data saved to local storage
    - Simulate connection restoration
    - Verify data synced to backend
  
  - [ ]* 7.5 Write property test for conflict resolution
    - **Property 16: Conflict resolution by timestamp**
    - **Validates: Requirements 11.6**
    - Generate two draft versions with different timestamps
    - Verify system selects version with most recent timestamp
  
  - [ ]* 7.6 Write property test for local storage sync
    - **Property 17: Local storage synchronization**
    - **Validates: Requirements 11.3, 11.4**
    - Save draft to local storage
    - Sync to backend
    - Verify local storage cleared after successful sync
  
  - [ ]* 7.7 Write unit tests for auto-save services
    - Test debounce timing
    - Test manual save
    - Test local storage fallback
    - Test conflict resolution
    - Test sync on reconnection
    - _Requirements: 2.1, 2.6, 11.2, 11.3, 11.4, 11.6_

- [ ] 8. Build auto-fill functionality
  - [ ] 8.1 Create profile data loader
    - Fetch user profile data on form initialization
    - Map profile fields to form fields
    - Handle missing profile data gracefully
    - Populate education, experience, skills, languages arrays
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_
  
  - [ ]* 8.2 Write property test for auto-fill completeness
    - **Property 1: Auto-fill completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Generate random user profiles with varying data
    - Open application form
    - Verify all profile data correctly transferred to form
    - Verify entry counts match
  
  - [ ]* 8.3 Write property test for user modifications persistence
    - **Property 3: User modifications persistence**
    - **Validates: Requirements 1.6, 7.7**
    - Auto-fill form from profile
    - Modify field values
    - Perform operations (navigate, save/load, preview)
    - Verify modified values preserved, never reverted
  
  - [ ]* 8.4 Write property test for empty profile handling
    - **Property 21: Empty profile field handling**
    - **Validates: Requirements 1.7**
    - Generate profiles with missing fields
    - Open application form
    - Verify empty fields don't cause errors
    - Verify fields left empty for manual entry
  
  - [ ]* 8.5 Write unit tests for auto-fill
    - Test complete profile auto-fill
    - Test partial profile auto-fill
    - Test empty profile
    - Test field modification
    - _Requirements: 1.1, 1.6, 1.7_

- [ ] 9. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Build multi-step form UI components
  - [ ] 10.1 Create MultiStepForm container component
    - Implement step navigation (next, previous)
    - Implement progress indicator
    - Implement step validation
    - Handle step transitions
    - Integrate with ApplicationContext
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  
  - [ ] 10.2 Create PersonalInfoStep component (Step 1)
    - Form fields: fullName, email, phone, country, city
    - Inline validation
    - Auto-fill from profile
    - Responsive layout
    - RTL support
    - _Requirements: 1.1, 9.1, 9.2, 9.3, 10.1-10.10_
  
  - [ ] 10.3 Create EducationExperienceStep component (Step 2)
    - Dynamic education entries (add/remove)
    - Dynamic experience entries (add/remove)
    - Auto-fill from profile
    - Validation for each entry
    - Responsive layout
    - _Requirements: 1.2, 1.3, 9.2, 9.3_
  
  - [ ] 10.4 Create SkillsLanguagesStep component (Step 3)
    - Dynamic skill entries (computer, software, other)
    - Dynamic language entries
    - Proficiency selectors
    - Auto-fill from profile
    - Responsive layout
    - _Requirements: 1.4, 1.5, 9.2, 9.3_
  
  - [ ]* 10.5 Write property test for step validation
    - **Property 7: Step validation enforcement**
    - **Validates: Requirements 7.4, 7.5**
    - Generate incomplete form data for various steps
    - Attempt to navigate to next step
    - Verify navigation prevented
    - Verify error messages displayed
  
  - [ ]* 10.6 Write property test for backward navigation
    - **Property 18: Backward navigation without validation**
    - **Validates: Requirements 7.6**
    - Generate form data with validation errors
    - Click previous button
    - Verify navigation occurs without validation
  
  - [ ]* 10.7 Write property test for progress indicator
    - **Property 19: Progress indicator accuracy**
    - **Validates: Requirements 7.2**
    - Navigate to various steps
    - Verify progress indicator shows correct current step
    - Verify completed steps marked correctly
  
  - [ ]* 10.8 Write unit tests for multi-step form
    - Test step navigation
    - Test validation
    - Test progress indicator
    - Test responsive layouts
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 11. Build file upload UI component
  - [ ] 11.1 Create FileUploadManager component
    - Implement drag-and-drop zone
    - Implement file selection dialog
    - Display upload progress
    - Display uploaded files list
    - Implement file removal
    - Show validation errors
    - Limit to 10 files
    - _Requirements: 4.1, 4.2, 4.5, 4.7, 4.8_
  
  - [ ] 11.2 Create DocumentsQuestionsStep component (Step 4)
    - Integrate FileUploadManager
    - Display custom questions dynamically
    - Render question types (text, choice, yes/no)
    - Validate required questions
    - Responsive layout
    - _Requirements: 4.1-4.10, 8.3, 8.4, 8.5_
  
  - [ ]* 11.3 Write property test for custom question validation
    - **Property 13: Custom question validation**
    - **Validates: Requirements 8.3**
    - Generate forms with required custom questions
    - Attempt submission without answers
    - Verify submission prevented
    - Verify error messages displayed
  
  - [ ]* 11.4 Write unit tests for file upload component
    - Test drag-and-drop
    - Test file selection
    - Test upload progress
    - Test file removal
    - Test validation errors
    - Test 10 file limit
    - _Requirements: 4.1, 4.2, 4.5, 4.7, 4.8_

- [ ] 12. Build preview and submission UI
  - [ ] 12.1 Create ApplicationPreview component
    - Display all form data in read-only format
    - Format data for employer view
    - Display all sections (personal, education, experience, skills, files, custom answers)
    - Implement edit buttons for each section
    - Implement final submit button
    - Show submission loading state
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [ ] 12.2 Create ReviewSubmitStep component (Step 5)
    - Integrate ApplicationPreview
    - Handle edit navigation
    - Handle final submission
    - Display success confirmation
    - Handle submission errors
    - _Requirements: 3.1-3.6_
  
  - [ ]* 12.3 Write property test for preview completeness
    - **Property 11: Preview data completeness**
    - **Validates: Requirements 3.2, 3.3**
    - Generate complete application data
    - Render preview
    - Verify all data displayed (personal, education, experience, skills, files, custom answers)
  
  - [ ]* 12.4 Write property test for custom answer persistence
    - **Property 14: Custom answer persistence**
    - **Validates: Requirements 8.6**
    - Generate custom question answers
    - Submit application
    - Retrieve application
    - Verify answers stored and displayed correctly
  
  - [ ]* 12.5 Write unit tests for preview and submission
    - Test preview rendering
    - Test edit navigation
    - Test submission flow
    - Test success handling
    - Test error handling
    - _Requirements: 3.1, 3.2, 3.4, 3.6_

- [ ] 13. Checkpoint - Form UI complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Build status tracking UI
  - [ ] 14.1 Create StatusTimeline component
    - Display status stages in order
    - Highlight current status
    - Show timestamps for completed stages
    - Handle different status types (accepted, rejected, withdrawn)
    - Responsive layout
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_
  
  - [ ] 14.2 Integrate Pusher for real-time status updates
    - Subscribe to application status channel
    - Handle status update events
    - Update UI in real-time
    - Show notification on status change
    - _Requirements: 5.5_
  
  - [ ]* 14.3 Write property test for status timeline accuracy
    - **Property 20: Status timeline accuracy**
    - **Validates: Requirements 5.2, 5.3**
    - Generate applications with status history
    - Render timeline
    - Verify all status changes displayed chronologically
    - Verify timestamps accurate
  
  - [ ]* 14.4 Write unit tests for status timeline
    - Test timeline rendering
    - Test status highlighting
    - Test timestamp display
    - Test Pusher integration
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 15. Implement withdrawal functionality
  - [ ] 15.1 Create withdrawal UI
    - Add withdraw button (conditional display)
    - Create confirmation dialog
    - Handle withdrawal API call
    - Update status timeline
    - Show success/error messages
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 15.2 Write property test for withdrawal completeness
    - **Property 10: Withdrawal completeness**
    - **Validates: Requirements 6.3, 6.4, 6.6**
    - Generate withdrawable applications
    - Perform withdrawal
    - Verify status updated to Withdrawn
    - Verify timeline entry added
    - Verify employer notification sent
  
  - [ ]* 15.3 Write unit tests for withdrawal
    - Test withdraw button display logic
    - Test confirmation dialog
    - Test withdrawal API call
    - Test status update
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 16. Integrate notification system
  - [ ] 16.1 Add notification triggers for status changes
    - Trigger notification on status update
    - Include application details in notification
    - Send to applicant
    - _Requirements: 5.4_
  
  - [ ] 16.2 Add notification trigger for withdrawal
    - Trigger notification on withdrawal
    - Send to employer
    - Include withdrawal timestamp
    - _Requirements: 6.4_
  
  - [ ]* 16.3 Write property test for status change notifications
    - **Property 8: Status change notifications**
    - **Validates: Requirements 5.4, 5.5**
    - Generate status changes
    - Verify Notification_Service called
    - Verify Pusher_Service called
    - Verify applicant receives both
  
  - [ ]* 16.4 Write unit tests for notifications
    - Test notification on status change
    - Test notification on withdrawal
    - Test notification content
    - _Requirements: 5.4, 6.4_

- [ ] 17. Build supporting UI components
  - [ ] 17.1 Create AutoSaveIndicator component
    - Display save status (saving, saved, error)
    - Show last saved timestamp
    - Show manual save button
    - Handle save errors
    - _Requirements: 2.5_
  
  - [ ] 17.2 Create ProgressIndicator component
    - Display current step
    - Display completed steps
    - Display remaining steps
    - Clickable step navigation (to completed steps)
    - Responsive design
    - _Requirements: 7.2_
  
  - [ ]* 17.3 Write property test for validation feedback
    - **Property 22: Validation feedback consistency**
    - **Validates: Requirements 9.2, 9.3**
    - Generate fields with various validation states
    - Verify error messages for invalid fields
    - Verify success indicators for valid fields
  
  - [ ]* 17.4 Write property test for error messages
    - **Property 23: Error message clarity**
    - **Validates: Requirements 9.6**
    - Generate various error conditions
    - Verify user-friendly error messages displayed
    - Verify messages include corrective actions
  
  - [ ]* 17.5 Write unit tests for supporting components
    - Test AutoSaveIndicator states
    - Test ProgressIndicator display
    - Test validation feedback
    - Test error messages
    - _Requirements: 2.5, 7.2, 9.2, 9.3, 9.6_

- [ ] 18. Implement responsive design and styling
  - [ ] 18.1 Apply Tailwind CSS classes and custom styles
    - Use color palette: Primary #304B60, Secondary #E3DAD1, Accent #D48161
    - Use input border color #D4816180 (never change)
    - Apply responsive breakpoints (<640px, 640-1023px, >1024px)
    - Ensure touch targets ≥44x44px on mobile
    - Use font-size ≥16px for inputs (prevent iOS zoom)
    - _Requirements: 10.1-10.10_
  
  - [ ] 18.2 Implement RTL support for Arabic
    - Apply RTL layout when language is Arabic
    - Use Amiri or Cairo font for Arabic
    - Mirror UI elements appropriately
    - Test all components in RTL mode
    - _Requirements: 9.8, 10.8_
  
  - [ ] 18.3 Apply fonts for all languages
    - Arabic: Amiri or Cairo
    - English: Cormorant Garamond
    - French: EB Garamond
    - Load fonts efficiently
    - _Requirements: 10.8, 10.9, 10.10_
  
  - [ ]* 18.4 Write unit tests for responsive behavior
    - Test mobile layouts
    - Test tablet layouts
    - Test desktop layouts
    - Test RTL layouts
    - _Requirements: 9.7, 9.8, 10.1-10.10_

- [ ] 19. Add custom questions management for employers
  - [ ] 19.1 Create custom questions UI in job posting form
    - Add section for custom questions
    - Support 5 question types (short text, long text, single choice, multiple choice, yes/no)
    - Allow up to 5 questions
    - Mark questions as required/optional
    - Set question order
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 19.2 Write unit tests for custom questions management
    - Test adding questions
    - Test question type selection
    - Test 5 question limit
    - Test required flag
    - Test question ordering
    - _Requirements: 8.1, 8.2_

- [ ] 20. Checkpoint - All features complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Integration testing and bug fixes
  - [ ] 21.1 Test complete application flow end-to-end
    - Test new application with auto-fill
    - Test draft save and restore
    - Test file upload and removal
    - Test multi-step navigation
    - Test preview and submission
    - Test status updates
    - Test withdrawal
    - _Requirements: All_
  
  - [ ] 21.2 Test error scenarios
    - Test network failures during save
    - Test network failures during submission
    - Test file upload failures
    - Test validation errors
    - Test concurrent draft updates
    - _Requirements: 2.6, 4.6, 9.6, 11.2, 11.3_
  
  - [ ] 21.3 Test edge cases
    - Test with empty profile
    - Test with maximum files (10)
    - Test with maximum custom questions (5)
    - Test with very long text inputs
    - Test with special characters
    - _Requirements: 1.7, 4.8, 8.1_
  
  - [ ]* 21.4 Write integration tests
    - Test complete submission flow
    - Test draft save/restore flow
    - Test file upload flow
    - Test status update flow
    - Test withdrawal flow

- [ ] 22. Performance optimization
  - [ ] 22.1 Optimize form rendering
    - Implement lazy loading for non-critical components
    - Optimize re-renders with React.memo
    - Debounce validation
    - Optimize file upload progress updates
    - _Requirements: 12.6_
  
  - [ ] 22.2 Optimize API calls
    - Implement request caching where appropriate
    - Batch multiple updates
    - Optimize draft save frequency
    - Add loading states
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.7_
  
  - [ ]* 22.3 Write performance tests
    - Test initial load time
    - Test step navigation time
    - Test save operation time
    - Test file upload time

- [ ] 23. Accessibility improvements
  - [ ] 23.1 Add ARIA labels and roles
    - Add labels to all form fields
    - Add ARIA roles to interactive elements
    - Add ARIA live regions for status updates
    - Add focus management for modals
    - _Requirements: 9.1-9.10_
  
  - [ ] 23.2 Implement keyboard navigation
    - Ensure all interactive elements keyboard accessible
    - Add keyboard shortcuts for common actions
    - Implement focus trapping in modals
    - Test tab order
    - _Requirements: 9.1-9.10_
  
  - [ ]* 23.3 Write accessibility tests
    - Test keyboard navigation
    - Test screen reader compatibility
    - Test ARIA labels
    - Test focus management

- [ ] 24. Documentation and deployment preparation
  - [ ] 24.1 Write API documentation
    - Document all endpoints
    - Provide request/response examples
    - Document error codes
    - Document authentication requirements
  
  - [ ] 24.2 Write component documentation
    - Document component props
    - Provide usage examples
    - Document state management
    - Document hooks
  
  - [ ] 24.3 Create user guide
    - Document application process
    - Document draft saving
    - Document file uploads
    - Document status tracking
    - Document withdrawal process
  
  - [ ] 24.4 Prepare deployment checklist
    - Environment variables configured
    - Cloudinary credentials set
    - Pusher credentials set
    - Database migrations run
    - Indexes created
    - Error logging configured

- [ ] 25. Final checkpoint - Ready for deployment
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests verify complete flows work end-to-end
- The implementation follows an incremental approach: backend → services → UI → integration
- All components support responsive design, RTL layout, and multi-language
- File uploads integrate with existing Cloudinary infrastructure
- Notifications integrate with existing notification system
- Real-time updates integrate with existing Pusher infrastructure
