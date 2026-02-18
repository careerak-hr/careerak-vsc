# Implementation Plan: Courses Page Enhancements

## Overview

This implementation plan breaks down the Courses Page Enhancements feature into discrete, manageable coding tasks. The plan follows an incremental approach where each task builds on previous work, with early validation through automated tests. The implementation will extend existing models, create new services, and build comprehensive frontend components.

The tasks are organized to deliver value incrementally: first establishing the data layer, then building the API layer, followed by frontend components, and finally integration with existing systems.

## Tasks

- [ ] 1. Extend EducationalCourse model with enhancement fields
  - Add new fields: price, topics, prerequisites, learningOutcomes, totalLessons, totalDuration, thumbnail, previewVideo, syllabus, instructorInfo, stats, badges, settings, publishedAt
  - Add database indexes for performance: level+category, price.isFree, stats.averageRating, stats.totalEnrollments, publishedAt, status
  - Add text index on title, description, and topics for search functionality
  - Update existing courses with default values for new fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 7.1_

- [ ] 2. Create new data models
  - [ ] 2.1 Create CourseEnrollment model
    - Define schema with course, student, enrolledAt, status, progress, completedAt, certificateIssued, payment fields
    - Add indexes: student+course (unique), student+status, course+status, progress.lastAccessedAt
    - Add methods: calculateProgress(), canReview()
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ] 2.2 Create CourseLesson model
    - Define schema with course, title, description, order, section, content, videoUrl, textContent, resources, duration, isFree, quiz fields
    - Add indexes: course+order, course+isFree
    - Add validation for lesson order uniqueness within course
    - _Requirements: 2.2, 4.1, 4.2, 4.4, 4.5_
  
  - [ ] 2.3 Create Wishlist model
    - Define schema with user and courses array (course, addedAt, notes)
    - Add indexes: user (unique), courses.course
    - Add methods: addCourse(), removeCourse(), hasCourse()
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 2.4 Write property test for CourseEnrollment progress calculation
    - **Property 18: Progress Calculation**
    - **Validates: Requirements 6.1**
  
  - [ ] 2.5 Write unit tests for model validations
    - Test CourseEnrollment validation rules
    - Test CourseLesson order uniqueness
    - Test Wishlist operations
    - _Requirements: 6.1, 8.1, 8.2_


- [ ] 3. Implement backend services
  - [ ] 3.1 Create filterService.js
    - Implement buildFilterQuery() to construct MongoDB queries from filter parameters
    - Implement buildSortObject() to handle different sort options
    - Support filters: level, category, duration range, price, minimum rating, search
    - Support sort: newest, popular, rating, price (low/high)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 3.2 Create badgeService.js
    - Implement updateCourseBadges() to assign/remove badges based on criteria
    - Implement getTopEnrollmentInCategory() for "Most Popular" badge
    - Implement getTopRatedInCategory() for "Top Rated" badge
    - Implement logic for "New" badge (published <= 30 days)
    - Implement logic for "Recommended" badge (rating >= 4.5, completion >= 70%)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ] 3.3 Create progressService.js
    - Implement calculateProgress() to compute completion percentage
    - Implement markLessonComplete() to update enrollment progress
    - Implement updateCourseCompletionRate() to recalculate course stats
    - Implement logic to detect course completion and trigger certificate generation
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [ ] 3.4 Create certificateService.js
    - Implement generateCertificate() to create PDF certificates
    - Implement generateCertificateId() for unique certificate IDs
    - Integrate with Cloudinary for certificate storage
    - Use PDF generation library (e.g., pdfkit or puppeteer)
    - _Requirements: 6.5_
  
  - [ ] 3.5 Write property tests for filterService
    - **Property 1: Filter Correctness**
    - **Property 2: Multi-Filter Composition**
    - **Property 3: Clear Filters Returns All**
    - **Property 23: Sort Order Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.3, 7.4, 7.5, 7.6**
  
  - [ ] 3.6 Write property tests for badgeService
    - **Property 12: Badge Assignment - Most Popular**
    - **Property 13: Badge Assignment - New**
    - **Property 14: Badge Assignment - Recommended**
    - **Property 15: Badge Assignment - Top Rated**
    - **Property 16: Badge Accumulation**
    - **Property 17: Badge Removal**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
  
  - [ ] 3.7 Write property tests for progressService
    - **Property 19: Course Completion Status**
    - **Property 20: Certificate Generation**
    - **Validates: Requirements 6.4, 6.5**
  
  - [ ] 3.8 Write unit tests for certificateService
    - Test certificate PDF generation
    - Test certificate ID uniqueness
    - Test Cloudinary upload integration
    - _Requirements: 6.5_

- [ ] 4. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement course controller endpoints
  - [ ] 5.1 Implement GET /courses with filtering and pagination
    - Extract query parameters: level, category, minDuration, maxDuration, isFree, minRating, search, sort, page, limit, view
    - Use filterService to build query and sort
    - Apply pagination (default 12 per page)
    - Return courses with populated stats
    - Include total count for pagination
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.1, 7.3, 7.4, 7.5, 7.6, 12.6_
  
  - [ ] 5.2 Implement GET /courses/:id for course details
    - Populate instructor information
    - Include syllabus with lessons
    - Include stats (enrollments, rating, reviews, completion rate)
    - Include badges
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.2, 4.3, 5.5_
  
  - [ ] 5.3 Implement GET /courses/:id/preview for preview content
    - Return first lesson marked as isFree
    - Return syllabus outline (titles only, no content)
    - Increment course.stats.previewViews counter
    - No authentication required
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [ ] 5.4 Implement POST /courses/:id/enroll for enrollment
    - Verify user authentication
    - Check if course is published
    - Check if user already enrolled
    - Create CourseEnrollment record
    - Update course.stats.totalEnrollments and activeEnrollments
    - Handle payment if course is paid
    - Send enrollment notification
    - _Requirements: 6.1, 11.2_
  
  - [ ] 5.5 Implement GET /courses/my-courses for user's enrollments
    - Return user's enrollments with populated course data
    - Include progress information
    - Sort by progress.lastAccessedAt descending
    - Filter by status if provided (active, completed, dropped)
    - _Requirements: 6.1, 6.2, 6.3, 6.6_
  
  - [ ] 5.6 Implement GET /courses/:id/progress for course progress
    - Verify user is enrolled
    - Return enrollment with progress details
    - Return next lesson to study
    - Return completion percentage
    - _Requirements: 6.1, 6.2_
  
  - [ ] 5.7 Implement POST /courses/:id/lessons/:lessonId/complete
    - Verify user is enrolled
    - Use progressService.markLessonComplete()
    - Check if course completed (100%)
    - Generate certificate if completed
    - Send completion notification if completed
    - Return updated progress
    - _Requirements: 6.4, 6.5, 11.2_
  
  - [ ] 5.8 Implement GET /courses/:id/certificate
    - Verify user completed the course
    - Verify certificate was issued
    - Return certificate URL
    - Track certificate downloads
    - _Requirements: 6.5_
  
  - [ ] 5.9 Write property tests for course endpoints
    - **Property 5: Course Update Consistency**
    - **Property 10: Preview Access Without Enrollment**
    - **Property 11: Preview View Tracking**
    - **Property 21: Enrollment Sort Order**
    - **Validates: Requirements 2.7, 4.1, 4.4, 4.5, 6.6**
  
  - [ ] 5.10 Write unit tests for course controller
    - Test enrollment creation and duplicate prevention
    - Test progress tracking and lesson completion
    - Test certificate generation and retrieval
    - Test error cases (not found, unauthorized, invalid data)
    - _Requirements: 6.1, 6.4, 6.5_

- [ ] 6. Implement course review controller endpoints
  - [ ] 6.1 Implement POST /courses/:id/reviews
    - Verify user is enrolled in course
    - Check enrollment progress >= 50%
    - Create review using existing Review model with reviewType: 'course_review'
    - Update course.stats.averageRating and totalReviews
    - Run badgeService.updateCourseBadges() to update badges
    - Send notification to instructor
    - _Requirements: 3.5, 3.6, 11.1_
  
  - [ ] 6.2 Implement GET /courses/:id/reviews
    - Get all approved reviews for course
    - Sort by helpfulCount descending (most helpful first)
    - Populate reviewer info (if not anonymous)
    - Include completion status
    - Paginate results
    - _Requirements: 3.4, 3.7, 3.8_
  
  - [ ] 6.3 Implement GET /courses/:id/reviews/stats
    - Calculate average rating
    - Calculate rating distribution (1-5 stars)
    - Return total reviews count
    - Return course completion rate
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 6.4 Implement PUT /courses/:id/reviews/:reviewId
    - Verify review ownership
    - Check edit window (24 hours)
    - Update review
    - Recalculate course.stats.averageRating
    - Update badges if rating changed significantly
    - _Requirements: 3.6_
  
  - [ ] 6.5 Implement POST /courses/:id/reviews/:reviewId/helpful
    - Use existing Review model markHelpful() method
    - Update review.helpfulCount
    - _Requirements: 3.7_
  
  - [ ] 6.6 Implement POST /courses/:id/reviews/:reviewId/response
    - Verify user is course instructor
    - Add response to review
    - Send notification to reviewer
    - _Requirements: 11.1_
  
  - [ ] 6.7 Write property tests for review endpoints
    - **Property 7: Review Authorization**
    - **Property 8: Rating Recalculation**
    - **Property 9: Review Sort Order**
    - **Validates: Requirements 3.5, 3.6, 3.7**
  
  - [ ] 6.8 Write unit tests for review controller
    - Test review creation with progress check
    - Test rating recalculation accuracy
    - Test review sorting by helpfulness
    - Test instructor response functionality
    - _Requirements: 3.5, 3.6, 3.7_

- [ ] 7. Implement wishlist controller endpoints
  - [ ] 7.1 Implement GET /wishlist
    - Return user's wishlist
    - Populate course details
    - Include course stats and badges
    - _Requirements: 8.3_
  
  - [ ] 7.2 Implement POST /wishlist/:courseId
    - Add course to user's wishlist
    - Set addedAt timestamp
    - Return updated wishlist
    - Handle duplicate adds gracefully
    - _Requirements: 8.1_
  
  - [ ] 7.3 Implement DELETE /wishlist/:courseId
    - Remove course from wishlist
    - Return updated wishlist
    - _Requirements: 8.2_
  
  - [ ] 7.4 Implement POST /wishlist/:courseId/notes
    - Update notes for wishlisted course
    - Return updated wishlist item
    - _Requirements: 8.3_
  
  - [ ]* 7.5 Write property tests for wishlist endpoints
    - **Property 24: Wishlist Add Operation**
    - **Property 25: Wishlist Remove Operation**
    - **Property 26: Wishlist Retrieval**
    - **Validates: Requirements 8.1, 8.2, 8.3**
  
  - [ ]* 7.6 Write unit tests for wishlist controller
    - Test add/remove operations
    - Test duplicate handling
    - Test notes functionality
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. Implement course sharing functionality
  - [ ] 8.1 Implement POST /courses/:id/share
    - Generate unique shareable URL with tracking token
    - Store referral information
    - Return shareable URL
    - _Requirements: 8.5_
  
  - [ ] 8.2 Implement GET /courses/shared/:token
    - Decode sharing token
    - Track referral source
    - Redirect to course details page
    - _Requirements: 8.6_
  
  - [ ] 8.3 Update enrollment endpoint to track referrals
    - Check for referral token in enrollment request
    - Credit referrer if token present
    - Store referral information in enrollment
    - _Requirements: 8.7, 8.9_
  
  - [ ]* 8.4 Write property tests for sharing functionality
    - **Property 27: Shareable URL Uniqueness**
    - **Property 28: Referral Tracking**
    - **Property 29: Referrer Credit**
    - **Validates: Requirements 8.5, 8.6, 8.7**

- [ ] 9. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create frontend components - Courses page
  - [ ] 10.1 Create CoursesPage.jsx main component
    - Set up state management for courses, filters, sort, view, loading, pagination
    - Implement fetchCourses() with API integration
    - Handle loading and error states
    - Implement responsive layout
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 10.1, 10.2, 10.3_
  
  - [ ] 10.2 Create CourseFilters.jsx component
    - Implement level filter (checkboxes)
    - Implement category filter (dropdown)
    - Implement duration range filter (slider)
    - Implement price filter (radio buttons)
    - Implement minimum rating filter (star selector)
    - Implement clear all filters button
    - Make responsive with collapsible drawer on mobile
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 10.4_
  
  - [ ] 10.3 Create CourseSortBar.jsx component
    - Implement sort dropdown (newest, popular, rating, price)
    - Implement view toggle (grid/list)
    - Implement search input with debouncing
    - Apply RTL support
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.2, 10.5_
  
  - [ ] 10.4 Create CourseCard.jsx component
    - Display course thumbnail with lazy loading
    - Display badges (most_popular, new, recommended, top_rated)
    - Display course title, description, level, duration, lessons
    - Display rating stars and review count
    - Display enrollment count
    - Display price or "Free" badge
    - Add wishlist button
    - Add "View Details" button
    - Support both grid and list view layouts
    - Apply project color palette and fonts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5, 9.5, 9.6, 10.6_
  
  - [ ] 10.5 Create CourseGrid.jsx component
    - Render courses in grid or list layout
    - Handle empty state with helpful message
    - Implement responsive columns (1 on mobile, 2 on tablet, 4 on desktop)
    - _Requirements: 1.8, 9.1, 9.2, 10.1, 10.2, 10.3_
  
  - [ ] 10.6 Create Pagination.jsx component
    - Display page numbers
    - Handle page navigation
    - Show total results count
    - Disable buttons appropriately
    - _Requirements: 12.6_
  
  - [ ]* 10.7 Write unit tests for courses page components
    - Test filter application and clearing
    - Test sort and view switching
    - Test search functionality
    - Test pagination
    - Test responsive behavior
    - _Requirements: 1.1, 1.7, 7.1, 9.3, 9.4_

- [ ] 11. Create frontend components - Course details page
  - [ ] 11.1 Create CourseDetailsPage.jsx main component
    - Set up routing with courseId parameter
    - Fetch course details and enrollment status
    - Implement tab navigation (overview, curriculum, instructor, reviews)
    - Handle loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3_
  
  - [ ] 11.2 Create CourseHero.jsx component
    - Display course thumbnail/video
    - Display course title and description
    - Display instructor info
    - Display rating and enrollment stats
    - Display price and enroll button
    - Display "Continue Learning" button if enrolled
    - Display progress bar if enrolled
    - Add wishlist and share buttons
    - _Requirements: 2.1, 3.1, 3.2, 6.1, 6.3, 8.1, 8.4_
  
  - [ ] 11.3 Create CourseOverview.jsx component
    - Display learning outcomes
    - Display prerequisites
    - Display topics covered
    - Display course duration and lesson count
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 11.4 Create CourseCurriculum.jsx component
    - Display syllabus with sections and lessons
    - Show lesson duration and type (video, text, quiz)
    - Mark completed lessons with checkmark
    - Show lock icon for non-enrolled users
    - Allow preview of free lessons
    - Navigate to lesson on click (if enrolled)
    - _Requirements: 4.1, 4.2, 6.1, 6.2_
  
  - [ ] 11.5 Create InstructorInfo.jsx component
    - Display instructor name and photo
    - Display instructor bio
    - Display credentials
    - Display social links
    - _Requirements: 4.3_
  
  - [ ] 11.6 Create CourseReviews.jsx component
    - Display review statistics (average rating, distribution)
    - Display review list sorted by helpfulness
    - Show reviewer name (or "Anonymous")
    - Show completion status badge
    - Show helpful/not helpful buttons
    - Show "Write a Review" button (if eligible)
    - Implement pagination
    - _Requirements: 3.1, 3.4, 3.5, 3.7, 3.8_
  
  - [ ] 11.7 Create ReviewForm.jsx component
    - Star rating input (1-5)
    - Detailed ratings inputs (content, instructor, value, practical)
    - Title input
    - Comment textarea
    - Pros/cons textareas
    - Would recommend checkbox
    - Anonymous option checkbox
    - Submit button with validation
    - _Requirements: 3.5_
  
  - [ ]* 11.8 Write unit tests for course details components
    - Test tab navigation
    - Test enrollment button behavior
    - Test review submission
    - Test curriculum display
    - _Requirements: 3.5, 4.1, 6.3_

- [ ] 12. Create frontend components - Course player and progress
  - [ ] 12.1 Create CoursePlayerPage.jsx
    - Display current lesson content (video, text, quiz)
    - Show lesson navigation (previous, next)
    - Show syllabus sidebar
    - Mark lesson as complete button
    - Track video progress
    - Handle quiz submissions
    - _Requirements: 6.2, 6.4_
  
  - [ ] 12.2 Create ProgressTracker.jsx component
    - Display progress bar with percentage
    - Display completed lessons count
    - Display "Continue Learning" button
    - Display certificate download button (if completed)
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [ ] 12.3 Create LessonContent.jsx component
    - Render video player for video lessons
    - Render markdown/HTML for text lessons
    - Render quiz interface for quiz lessons
    - Display lesson resources (downloads)
    - _Requirements: 6.2_
  
  - [ ] 12.4 Create QuizComponent.jsx
    - Display quiz questions
    - Handle answer selection
    - Show correct/incorrect feedback
    - Calculate and display score
    - Mark lesson complete on passing score
    - _Requirements: 6.4_
  
  - [ ]* 12.5 Write unit tests for course player components
    - Test lesson navigation
    - Test progress tracking
    - Test quiz functionality
    - Test certificate display
    - _Requirements: 6.1, 6.4, 6.5_

- [ ] 13. Create frontend components - Wishlist and sharing
  - [ ] 13.1 Create WishlistButton.jsx component
    - Display heart icon (filled if wishlisted)
    - Toggle wishlist on click
    - Show loading state
    - Handle authentication requirement
    - _Requirements: 8.1, 8.2_
  
  - [ ] 13.2 Create WishlistPage.jsx
    - Display user's wishlisted courses
    - Show course cards with remove button
    - Show notes for each course
    - Handle empty wishlist state
    - _Requirements: 8.3_
  
  - [ ] 13.3 Create ShareModal.jsx component
    - Display share options (copy link, social media)
    - Generate and copy shareable URL
    - Show success message
    - Track share events
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 13.4 Write unit tests for wishlist and sharing
    - Test wishlist add/remove
    - Test share URL generation
    - Test social media sharing
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 14. Implement responsive design and accessibility
  - [ ] 14.1 Apply responsive breakpoints
    - Mobile (< 640px): single column, collapsible filters
    - Tablet (640-1023px): two columns
    - Desktop (>= 1024px): four columns
    - Test on various devices
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 14.2 Implement RTL support
    - Apply text-align: right for Arabic
    - Mirror flex layouts with flex-direction: row-reverse
    - Test all components in RTL mode
    - _Requirements: 10.5_
  
  - [ ] 14.3 Apply project design standards
    - Use color palette: #304B60 (primary), #E3DAD1 (secondary), #D48161 (accent)
    - Use fonts: Amiri/Cairo (Arabic), Cormorant Garamond (English)
    - Apply border colors: #D4816180 for input fields
    - _Requirements: 10.6_
  
  - [ ] 14.4 Ensure accessibility compliance
    - Minimum touch target size 44x44px
    - Proper ARIA labels
    - Keyboard navigation support
    - Screen reader compatibility
    - Color contrast compliance
    - _Requirements: 10.7_
  
  - [ ]* 14.5 Write accessibility tests
    - Test keyboard navigation
    - Test screen reader compatibility
    - Test touch target sizes
    - _Requirements: 10.7_

- [ ] 15. Integrate with existing systems
  - [ ] 15.1 Integrate with notification system
    - Send notification on new course review (to instructor)
    - Send notification on course completion (to student)
    - Send notification on enrollment (to student)
    - Use existing notificationService
    - _Requirements: 11.1, 11.2_
  
  - [ ] 15.2 Extend Review model for course reviews
    - Add reviewType: 'course_review'
    - Add course reference field
    - Add enrollment reference field
    - Add completionStatus field
    - Update Review model methods to handle course reviews
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ] 15.3 Add error logging
    - Log all errors with context
    - Use existing logger utility
    - Include stack traces
    - _Requirements: 11.6_
  
  - [ ] 15.4 Add API caching headers
    - Set Cache-Control headers for GET endpoints
    - Set ETag headers for course data
    - Implement conditional requests (If-None-Match)
    - _Requirements: 12.7_
  
  - [ ]* 15.5 Write integration tests
    - Test notification sending
    - Test review system integration
    - Test error logging
    - Test caching behavior
    - _Requirements: 11.1, 11.2, 11.6, 12.7_

- [ ] 16. Add API routes and wire everything together
  - [ ] 16.1 Create courseRoutes.js
    - Define all course endpoints
    - Apply authentication middleware
    - Apply validation middleware
    - Apply rate limiting
    - _Requirements: All course-related requirements_
  
  - [ ] 16.2 Create courseReviewRoutes.js
    - Define all review endpoints
    - Apply authentication middleware
    - Apply validation middleware
    - _Requirements: All review-related requirements_
  
  - [ ] 16.3 Create wishlistRoutes.js
    - Define all wishlist endpoints
    - Apply authentication middleware
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 16.4 Update app.js to register new routes
    - Add /courses routes
    - Add /courses/:id/reviews routes
    - Add /wishlist routes
    - Ensure proper route ordering
    - _Requirements: All requirements_
  
  - [ ] 16.5 Create frontend routing
    - Add /courses route (CoursesPage)
    - Add /courses/:id route (CourseDetailsPage)
    - Add /courses/:id/learn route (CoursePlayerPage)
    - Add /wishlist route (WishlistPage)
    - Update navigation menu
    - _Requirements: All frontend requirements_

- [ ] 17. Final checkpoint - End-to-end testing
  - [ ] 17.1 Test complete user flow: browse → filter → view details → enroll
    - Verify filtering works correctly
    - Verify course details display properly
    - Verify enrollment process
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 17.2 Test complete user flow: learn → progress → complete → certificate
    - Verify lesson navigation
    - Verify progress tracking
    - Verify course completion detection
    - Verify certificate generation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 17.3 Test complete user flow: review → rate → helpful
    - Verify review submission with progress check
    - Verify rating calculation
    - Verify helpful voting
    - _Requirements: 3.5, 3.6, 3.7_
  
  - [ ] 17.4 Test wishlist and sharing flows
    - Verify add/remove from wishlist
    - Verify share URL generation
    - Verify referral tracking
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_
  
  - [ ] 17.5 Test responsive design on multiple devices
    - Test on mobile (iPhone, Android)
    - Test on tablet (iPad)
    - Test on desktop (various screen sizes)
    - Test RTL mode
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 17.6 Test integration with existing systems
    - Verify notifications are sent correctly
    - Verify review system integration
    - Verify error logging
    - _Requirements: 11.1, 11.2, 11.6_
  
  - [ ] 17.7 Performance testing
    - Test page load times
    - Test filter response times
    - Test search performance
    - Verify database indexes are used
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property tests
  - Run all integration tests
  - Run all E2E tests
  - Verify test coverage meets goals (80%+ for unit tests)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test-related sub-tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests verify system-to-system interactions
- E2E tests validate complete user workflows
- Checkpoints ensure incremental validation and allow for user feedback
- All code should follow existing patterns in the Careerak codebase
- Use existing services (notification, file upload, authentication) where applicable
- Apply project design standards (colors, fonts, RTL support) consistently
