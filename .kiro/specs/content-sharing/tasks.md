# Tasks - Content Sharing Feature

## Phase 1: Backend Infrastructure (Week 1-2)

- [ ] 1.1 Create Share model (MongoDB schema)
  - [ ] 1.1.1 Define schema fields (contentType, contentId, userId, shareMethod, timestamp, utmParams)
  - [ ] 1.1.2 Add indexes for performance (contentId, userId, timestamp)
  - [ ] 1.1.3 Add validation rules
- [ ] 1.2 Create ShareAnalytics model
  - [ ] 1.2.1 Define schema for tracking metrics
  - [ ] 1.2.2 Add aggregation methods
- [ ] 1.3 Implement shareService.js
  - [ ] 1.3.1 generateShareLink() function
  - [ ] 1.3.2 recordShare() function
  - [ ] 1.3.3 getShareAnalytics() function
  - [ ] 1.3.4 validateSharePermissions() function
- [ ] 1.4 Create shareController.js
  - [ ] 1.4.1 POST /api/shares - Record share event
  - [ ] 1.4.2 GET /api/shares/analytics - Get analytics
  - [ ] 1.4.3 GET /api/shares/:contentType/:contentId - Get share count
- [ ] 1.5 Add share routes to Express app
- [ ] 1.6 Write unit tests for share service (10+ tests)

## Phase 2: Share Metadata Generation (Week 2)

- [ ] 2.1 Implement metadataService.js
  - [ ] 2.1.1 generateOpenGraphTags() for jobs
  - [ ] 2.1.2 generateOpenGraphTags() for courses
  - [ ] 2.1.3 generateOpenGraphTags() for user profiles
  - [ ] 2.1.4 generateOpenGraphTags() for company profiles
  - [ ] 2.1.5 generateTwitterCardTags() for all content types
- [ ] 2.2 Add metadata endpoints
  - [ ] 2.2.1 GET /api/metadata/job/:id
  - [ ] 2.2.2 GET /api/metadata/course/:id
  - [ ] 2.2.3 GET /api/metadata/profile/:id
  - [ ] 2.2.4 GET /api/metadata/company/:id
- [ ] 2.3 Update content routes to include metadata in HTML head
- [ ] 2.4 Test metadata with Facebook Debugger and Twitter Card Validator

## Phase 3: Frontend Share Component (Week 3)

- [ ] 3.1 Create ShareButton component
  - [ ] 3.1.1 Design share icon button
  - [ ] 3.1.2 Add click handler to open share modal
  - [ ] 3.1.3 Add loading state
  - [ ] 3.1.4 Add error state
- [ ] 3.2 Create ShareModal component
  - [ ] 3.2.1 Design modal layout (grid of share options)
  - [ ] 3.2.2 Add internal share option (chat)
  - [ ] 3.2.3 Add external share options (Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email)
  - [ ] 3.2.4 Add copy link option
  - [ ] 3.2.5 Add close button and backdrop
- [ ] 3.3 Implement share methods
  - [ ] 3.3.1 shareViaChat() - Open chat with pre-filled message
  - [ ] 3.3.2 shareViaFacebook() - Open Facebook share dialog
  - [ ] 3.3.3 shareViaTwitter() - Open Twitter share dialog
  - [ ] 3.3.4 shareViaLinkedIn() - Open LinkedIn share dialog
  - [ ] 3.3.5 shareViaWhatsApp() - Open WhatsApp with message
  - [ ] 3.3.6 shareViaTelegram() - Open Telegram share
  - [ ] 3.3.7 shareViaEmail() - Open email client
  - [ ] 3.3.8 copyToClipboard() - Copy link to clipboard
- [ ] 3.4 Add translations for all share labels (ar, en, fr)
- [ ] 3.5 Style ShareModal with responsive design

## Phase 4: Integration with Existing Pages (Week 3-4)

- [ ] 4.1 Add ShareButton to JobPostingCard component
- [ ] 4.2 Add ShareButton to JobDetailsPage
- [ ] 4.3 Add ShareButton to CourseCard component
- [ ] 4.4 Add ShareButton to CourseDetailsPage
- [ ] 4.5 Add ShareButton to UserProfilePage
- [ ] 4.6 Add ShareButton to CompanyProfilePage
- [ ] 4.7 Test share functionality on all pages

## Phase 5: Internal Sharing via Chat (Week 4)

- [ ] 5.1 Create ContactSelector component for internal sharing
  - [ ] 5.1.1 Fetch recent chat contacts
  - [ ] 5.1.2 Display contact list with search
  - [ ] 5.1.3 Handle contact selection
- [ ] 5.2 Update Chat system to support shared content
  - [ ] 5.2.1 Add message type: 'shared_content'
  - [ ] 5.2.2 Create SharedContentPreview component
  - [ ] 5.2.3 Handle click on shared content to navigate
- [ ] 5.3 Integrate with notification system
  - [ ] 5.3.1 Send notification when content is shared
  - [ ] 5.3.2 Include content preview in notification
- [ ] 5.4 Test internal sharing workflow

## Phase 6: Share Analytics Dashboard (Week 5)

- [ ] 6.1 Create ShareAnalytics component
  - [ ] 6.1.1 Display total shares by content type
  - [ ] 6.1.2 Display shares by platform (chart)
  - [ ] 6.1.3 Display most shared content (top 10)
  - [ ] 6.1.4 Display share-to-conversion rate
- [ ] 6.2 Add analytics to Admin Dashboard
- [ ] 6.3 Create API endpoint for analytics data
  - [ ] 6.3.1 GET /api/shares/analytics/summary
  - [ ] 6.3.2 GET /api/shares/analytics/by-platform
  - [ ] 6.3.3 GET /api/shares/analytics/top-content
- [ ] 6.4 Add date range filter for analytics
- [ ] 6.5 Add export functionality (CSV, JSON)

## Phase 7: Mobile Optimization (Week 5-6)

- [ ] 7.1 Implement native share sheet for mobile
  - [ ] 7.1.1 Detect mobile device
  - [ ] 7.1.2 Use navigator.share() API when available
  - [ ] 7.1.3 Fallback to custom modal on unsupported devices
- [ ] 7.2 Optimize share button size for touch (44x44px minimum)
- [ ] 7.3 Test on iOS Safari
- [ ] 7.4 Test on Android Chrome
- [ ] 7.5 Test on various screen sizes (320px to 1920px)

## Phase 8: Testing and Quality Assurance (Week 6)

- [ ] 8.1 Write unit tests for share service (backend)
- [ ] 8.2 Write unit tests for share components (frontend)
- [ ] 8.3 Write integration tests for share workflows
- [ ] 8.4 Test all share methods (internal, Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email, Copy)
- [ ] 8.5 Test metadata with social media debuggers
- [ ] 8.6 Test privacy and permissions
- [ ] 8.7 Test error handling (network errors, API failures)
- [ ] 8.8 Test performance (share button response time < 200ms)
- [ ] 8.9 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] 8.10 Test on multiple devices (Desktop, Tablet, Mobile)

## Phase 9: Documentation and Deployment (Week 6)

- [ ] 9.1 Write user documentation (how to share content)
- [ ] 9.2 Write developer documentation (API reference)
- [ ] 9.3 Create video tutorial for sharing feature
- [ ] 9.4 Update project README with sharing feature
- [ ] 9.5 Deploy to staging environment
- [ ] 9.6 Conduct user acceptance testing (UAT)
- [ ] 9.7 Fix bugs found in UAT
- [ ] 9.8 Deploy to production
- [ ] 9.9 Monitor analytics for first week
- [ ] 9.10 Gather user feedback
