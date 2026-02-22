# Error Logging Backend Integration

**Date**: 2026-02-21  
**Status**: ✅ Complete  
**Task**: 9.1.4 - Integrate error logging with backend  
**Requirements**: FR-ERR-3

## Overview

This document describes the integration of frontend error logging with the Careerak backend. All errors caught by Error Boundaries are now automatically sent to the backend for centralized monitoring and analysis.

## Architecture

```
Frontend Error → Error Boundary → errorTracking.js → Backend API → MongoDB
```

### Components

1. **Frontend Error Boundaries**
   - `RouteErrorBoundary.jsx` - Full-page errors
   - `ComponentErrorBoundary.jsx` - Component-level errors

2. **Error Tracking Utility**
   - `frontend/src/utils/errorTracking.js` - Unified error tracking interface

3. **Backend API**
   - `backend/src/models/ErrorLog.js` - MongoDB model
   - `backend/src/controllers/errorLogController.js` - API controller
   - `backend/src/routes/errorLogRoutes.js` - API routes

4. **Initialization**
   - `frontend/src/core/BootstrapManager.js` - Initializes error tracking on app start

## Backend API Endpoints

### Log Error (Authenticated Users)
```http
POST /errors
Authorization: Bearer <token>
Content-Type: application/json

{
  "error": {
    "message": "Cannot read property 'map' of undefined",
    "stack": "TypeError: Cannot read property...",
    "name": "TypeError"
  },
  "context": {
    "component": "JobPostingsPage",
    "action": "fetchJobs",
    "errorBoundary": "ComponentErrorBoundary",
    "level": "error",
    "extra": {
      "filters": { "location": "Algiers" }
    }
  },
  "environment": "production",
  "release": "1.0.0",
  "url": "https://careerak.com/jobs",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Error logged successfully",
  "errorId": "507f1f77bcf86cd799439011",
  "count": 1
}
```

### Get Error Logs (Admin Only)
```http
GET /errors?environment=production&level=error&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "errors": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "message": "Cannot read property 'map' of undefined",
      "component": "JobPostingsPage",
      "action": "fetchJobs",
      "userId": {
        "_id": "507f191e810c19729de860ea",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "environment": "production",
      "level": "error",
      "count": 5,
      "firstOccurrence": "2026-02-21T10:00:00.000Z",
      "lastOccurrence": "2026-02-21T14:30:00.000Z",
      "status": "new",
      "createdAt": "2026-02-21T10:00:00.000Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "totalErrors": 200
}
```

### Get Error Statistics (Admin Only)
```http
GET /errors/statistics?environment=production&startDate=2026-02-01&endDate=2026-02-21
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalErrors": 150,
    "totalOccurrences": 450,
    "errorsByLevel": [
      { "level": "error", "count": 120 },
      { "level": "warning", "count": 25 },
      { "level": "info", "count": 5 }
    ],
    "errorsByComponent": [
      { "component": "JobPostingsPage", "count": 45 },
      { "component": "ProfilePage", "count": 30 }
    ]
  }
}
```

### Update Error Status (Admin Only)
```http
PATCH /errors/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "resolved",
  "notes": "Fixed in version 1.0.1"
}
```

### Delete Error Log (Admin Only)
```http
DELETE /errors/:id
Authorization: Bearer <admin-token>
```

## MongoDB Schema

```javascript
{
  // Error details
  message: String (required, indexed),
  stack: String,
  name: String,
  
  // Context
  component: String (required, indexed),
  action: String,
  errorBoundary: String (enum),
  
  // User information
  userId: ObjectId (ref: User, indexed),
  userEmail: String,
  userRole: String (enum),
  
  // Environment
  environment: String (enum, indexed),
  release: String,
  
  // Browser/Device info
  url: String (required),
  userAgent: String,
  browser: { name: String, version: String },
  os: { name: String, version: String },
  device: String (enum),
  
  // Error metadata
  level: String (enum, indexed),
  count: Number (default: 1),
  firstOccurrence: Date,
  lastOccurrence: Date,
  
  // Status
  status: String (enum, indexed),
  resolvedAt: Date,
  resolvedBy: ObjectId (ref: User),
  notes: String,
  
  // Additional data
  extra: Mixed,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### 1. Error Grouping
Similar errors are automatically grouped together:
- Same message + component + action = same error
- Count is incremented for duplicate errors
- First and last occurrence timestamps are tracked

### 2. User Context
Errors include user information when available:
- User ID
- Email
- Role (employee, company, admin)

### 3. Browser/Device Detection
Automatic parsing of user agent:
- Browser name and version
- OS name and version
- Device type (desktop, mobile, tablet)

### 4. Error Status Management
Admins can manage error status:
- `new` - Newly logged error
- `acknowledged` - Admin has seen it
- `resolved` - Fixed
- `ignored` - Not important

### 5. Statistics and Analytics
Get insights about errors:
- Total errors and occurrences
- Errors by level (error, warning, info)
- Errors by component
- Time-based filtering

## Frontend Integration

### Automatic Initialization
Error tracking is automatically initialized when the app starts:

```javascript
// frontend/src/core/BootstrapManager.js
await _initErrorTracking();
```

### Error Boundaries
Both error boundaries automatically log errors:

```javascript
// RouteErrorBoundary.jsx
logError(error, {
  component: componentName,
  action: 'route-render',
  userId: this.props.user?._id,
  level: 'error',
  extra: {
    componentStack: errorInfo.componentStack,
    errorBoundary: 'RouteErrorBoundary',
  },
});
```

### Manual Error Logging
You can also log errors manually:

```javascript
import { logError } from '../utils/errorTracking';

try {
  // Your code
} catch (error) {
  logError(error, {
    component: 'JobPostingsPage',
    action: 'fetchJobs',
    level: 'error',
    extra: { filters: { location: 'Algiers' } },
  });
}
```

## Configuration

### Frontend Configuration
```javascript
// frontend/src/core/BootstrapManager.js
initErrorTracking({
  service: 'custom',           // Use Careerak backend
  enabled: true,               // Always enabled
  environment: 'production',   // Current environment
  release: '1.0.0',           // App version
  sampleRate: 1.0,            // Track all errors (100%)
  ignoreErrors: [             // Errors to ignore
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ],
});
```

### Backend Configuration
No additional configuration needed. The error logging routes are automatically registered in `app.js`.

## Security

### Authentication
- Error logging requires authentication (Bearer token)
- Only authenticated users can log errors
- Only admins can view/manage error logs

### Data Sanitization
- All inputs are sanitized with `express-mongo-sanitize`
- XSS protection with `xss-clean`
- Rate limiting applied to all API routes

### Privacy
- Sensitive data should not be included in error logs
- User passwords are never logged
- Auth tokens are never logged

## Monitoring and Alerts

### Admin Dashboard
Admins can monitor errors through:
1. Error list with filters
2. Error statistics
3. Individual error details
4. Status management

### Future Enhancements
- Email alerts for critical errors
- Slack/Discord integration
- Error trends and patterns
- Automatic error resolution suggestions

## Testing

### Manual Testing
```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend
cd frontend
npm run dev

# 3. Trigger an error in the app
# 4. Check backend logs
# 5. Check MongoDB for error log
```

### API Testing with curl
```bash
# Log an error
curl -X POST http://localhost:5000/errors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Test error",
      "stack": "Error: Test error\n    at ...",
      "name": "Error"
    },
    "context": {
      "component": "TestComponent",
      "action": "test",
      "level": "error"
    },
    "environment": "development",
    "url": "http://localhost:3000/test",
    "userAgent": "Mozilla/5.0..."
  }'

# Get error logs (admin only)
curl -X GET http://localhost:5000/errors \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Troubleshooting

### Errors not being logged
1. Check if user is authenticated (token in localStorage)
2. Check browser console for error tracking logs
3. Check backend logs for API errors
4. Verify MongoDB connection

### Backend API errors
1. Check if error routes are registered in `app.js`
2. Verify authentication middleware is working
3. Check MongoDB connection
4. Review backend logs

### Frontend not sending errors
1. Check if error tracking is initialized
2. Verify `VITE_API_URL` environment variable
3. Check browser console for fetch errors
4. Verify auth token is valid

## Files Modified/Created

### Backend
- ✅ `backend/src/models/ErrorLog.js` - MongoDB model
- ✅ `backend/src/controllers/errorLogController.js` - API controller
- ✅ `backend/src/routes/errorLogRoutes.js` - API routes
- ✅ `backend/src/app.js` - Register error routes

### Frontend
- ✅ `frontend/src/utils/errorTracking.js` - Updated custom service
- ✅ `frontend/src/core/BootstrapManager.js` - Initialize error tracking

### Documentation
- ✅ `docs/ERROR_LOGGING_BACKEND_INTEGRATION.md` - This file

## Benefits

1. **Centralized Monitoring** - All errors in one place
2. **User Context** - Know which users are affected
3. **Error Grouping** - Identify recurring issues
4. **Statistics** - Understand error patterns
5. **Admin Management** - Track and resolve errors
6. **Production Ready** - Works in all environments

## Next Steps

1. ✅ Backend API implementation
2. ✅ Frontend integration
3. ✅ Error grouping logic
4. ✅ Admin endpoints
5. ⏳ Admin dashboard UI (future)
6. ⏳ Email alerts (future)
7. ⏳ Error analytics (future)

## Conclusion

Error logging is now fully integrated with the backend. All errors caught by Error Boundaries are automatically sent to MongoDB for centralized monitoring and analysis. Admins can view, manage, and track errors through the API endpoints.

---

**Last Updated**: 2026-02-21  
**Author**: Kiro AI Assistant  
**Task**: 9.1.4 - Integrate error logging with backend
