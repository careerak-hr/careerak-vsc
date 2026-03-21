# Apply Page Enhancements - Quick Reference Guide

**Last Updated**: 2026-03-05  
**Status**: ✅ Production Ready

---

## 🚀 Quick Start

### For Developers

**Backend API Endpoints**:
```bash
# Draft Management
POST   /api/applications/drafts              # Create/update draft
GET    /api/applications/drafts/:jobId       # Get draft
DELETE /api/applications/drafts/:draftId     # Delete draft

# Application Management
POST   /api/applications                     # Submit application
GET    /api/applications/:id                 # Get application
PATCH  /api/applications/:id/withdraw        # Withdraw application
PATCH  /api/applications/:id/status          # Update status (HR only)
```

**Frontend Components**:
```jsx
// Main container
import ApplicationFormContainer from './components/ApplicationFormContainer';

// Multi-step form
import MultiStepForm from './components/MultiStepForm';

// File upload
import FileUploadManager from './components/FileUploadManager';

// Preview
import ApplicationPreview from './components/ApplicationPreview';

// Status timeline
import StatusTimeline from './components/StatusTimeline';
```

**State Management**:
```jsx
import { useApplicationForm } from './context/ApplicationContext';

const { formData, setField, nextStep, prevStep, saveForm } = useApplicationForm();
```

---

## 📋 Key Features

### 1. Auto-Fill
- Automatically populates from user profile
- Supports: education, experience, skills, languages
- User can modify any field

### 2. Auto-Save
- Saves every 3 seconds after changes
- Local storage fallback if offline
- Manual save button available

### 3. Multi-Step Form
- **Step 1**: Personal Information
- **Step 2**: Education & Experience
- **Step 3**: Skills & Languages
- **Step 4**: Documents & Questions
- **Step 5**: Review & Submit

### 4. File Upload
- Drag-and-drop support
- Up to 10 files
- Max 5MB per file
- Allowed: PDF, DOC, DOCX, JPG, PNG

### 5. Status Tracking
- Visual timeline
- Real-time updates (Pusher)
- Notifications on changes

### 6. Withdrawal
- Available for: Pending, Reviewed
- Confirmation required
- Notifies employer

---

## 🧪 Testing

### Run All Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Property-based tests
npm test -- --testNamePattern="Property"

# Integration tests
npm test -- --testNamePattern="Integration"
```

### Run Specific Tests
```bash
# Draft management
npm test -- draft

# Application submission
npm test -- application

# File upload
npm test -- file-upload

# Responsive design
npm test -- responsive
```

---

## 🎨 Design System

### Colors
```css
--primary: #304B60;      /* كحلي */
--secondary: #E3DAD1;    /* بيج */
--accent: #D48161;       /* نحاسي */
--input-border: #D4816180; /* نحاسي باهت - NEVER CHANGE */
```

### Fonts
```css
/* Arabic */
font-family: 'Amiri', 'Cairo', serif;

/* English */
font-family: 'Cormorant Garamond', serif;

/* French */
font-family: 'EB Garamond', serif;
```

### Breakpoints
```css
/* Mobile */
@media (max-width: 639px) { }

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=eu
```

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Initial Load | < 2s | ✅ |
| Step Navigation | < 300ms | ✅ |
| Auto-Save | < 1s | ✅ |
| File Upload Progress | Every 500ms | ✅ |
| Profile Loading | < 1s | ✅ |
| Final Submission | < 3s | ✅ |

---

## ♿ Accessibility

### WCAG 2.1 Level AA
- ✅ All form fields have labels
- ✅ ARIA roles on interactive elements
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast meets standards
- ✅ Touch targets ≥44x44px
- ✅ Screen reader compatible

### Keyboard Shortcuts
- `Tab`: Navigate forward
- `Shift+Tab`: Navigate backward
- `Enter`: Submit/Confirm
- `Esc`: Close modal/Cancel
- `Arrow Keys`: Navigate in dropdowns

---

## 🐛 Common Issues

### Issue: Auto-save not working
**Solution**: Check network connection, verify localStorage not full

### Issue: File upload fails
**Solution**: Check file size (≤5MB), verify file type (PDF, DOC, DOCX, JPG, PNG)

### Issue: Draft not loading
**Solution**: Check authentication, verify jobPostingId is correct

### Issue: Status not updating
**Solution**: Check Pusher connection, verify WebSocket not blocked

### Issue: Form validation errors
**Solution**: Check all required fields, verify email format, phone format

---

## 📞 Support

### Technical Issues
- Check console for errors
- Verify environment variables
- Check network requests in DevTools
- Review error logs

### User Issues
- Verify user is authenticated
- Check user role (Employee vs HR)
- Verify job posting exists and is active
- Check application status

---

## 🔗 Useful Links

### Documentation
- [Requirements](./requirements.md)
- [Design](./design.md)
- [Tasks](./tasks.md)
- [Deployment Checklist](./DEPLOYMENT_READINESS_CHECKLIST.md)
- [Final Summary](./FINAL_CHECKPOINT_SUMMARY.md)

### External Services
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Pusher Dashboard](https://dashboard.pusher.com)
- [MongoDB Atlas](https://cloud.mongodb.com)

---

## 📈 Monitoring

### Key Metrics to Watch
- Application completion rate
- Abandonment rate
- Auto-save usage
- File upload success rate
- Mobile usage percentage
- Average application time
- Error rate

### Alerts
- Application submission failures
- File upload failures
- Auto-save failures
- Status update failures
- High error rate (> 5%)

---

## 🎯 Success Criteria

### Week 1
- Zero critical bugs
- Application completion rate > 70%
- Auto-save usage > 60%
- File upload success rate > 95%

### Month 1
- Application time < 5 minutes
- Abandonment rate < 30%
- Mobile usage > 40%
- User satisfaction > 4.5/5

---

**Quick Reference Version**: 1.0  
**For Questions**: Contact Development Team
