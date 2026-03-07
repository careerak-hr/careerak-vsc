# Course Controller Endpoints

## Overview
This document describes all course-related API endpoints implemented in the Course Controller.

## Endpoints

### Public Endpoints (No Authentication Required)

#### 1. GET /courses
Get all courses with filtering and pagination.

**Query Parameters:**
- `level` (string): Filter by level (Beginner/Intermediate/Advanced)
- `category` (string): Filter by category
- `minDuration` (number): Minimum duration in hours
- `maxDuration` (number): Maximum duration in hours
- `isFree` (boolean): Filter free/paid courses
- `minRating` (number): Minimum rating (0-5)
- `search` (string): Search in title, description, topics
- `sort` (string): Sort option (newest/popular/rating/price_low/price_high)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `view` (string): View mode (grid/list)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {...}
  }
}
```

#### 2. GET /courses/:id
Get course details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {...},
    "enrollment": {...},
    "isEnrolled": false
  }
}
```

#### 3. GET /courses/:id/preview
Get preview content for a course (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {...},
    "freeLesson": {...},
    "syllabusOutline": [...]
  }
}
```

### Protected Endpoints (Authentication Required)

#### 4. POST /courses/:id/enroll
Enroll user in a course.

**Headers:**
- `Authorization: Bearer <token>`

**Body (for paid courses):**
```json
{
  "transactionId": "txn_123456",
  "amount": 99.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": {...}
  }
}
```

#### 5. GET /courses/my-courses
Get user's enrolled courses.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string): Filter by status (active/completed/dropped)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [...],
    "count": 5
  }
}
```

#### 6. GET /courses/:id/progress
Get course progress for enrolled user.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment": {...},
    "nextLesson": {...},
    "progress": {
      "percentageComplete": 45,
      "completedLessons": 5,
      "lastAccessedAt": "2026-03-03T10:00:00Z"
    }
  }
}
```

#### 7. POST /courses/:id/lessons/:lessonId/complete
Mark a lesson as complete.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "data": {
    "enrollment": {...},
    "progress": {
      "percentageComplete": 50,
      "completedLessons": 6,
      "status": "active"
    },
    "certificate": null
  }
}
```

**Response (when course completed):**
```json
{
  "success": true,
  "message": "Congratulations! You completed the course!",
  "data": {
    "enrollment": {...},
    "progress": {
      "percentageComplete": 100,
      "completedLessons": 10,
      "status": "completed"
    },
    "certificate": {
      "issued": true,
      "certificateUrl": "https://...",
      "certificateId": "CERT-..."
    }
  }
}
```

#### 8. GET /courses/:id/certificate
Get course completion certificate.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "certificateUrl": "https://...",
      "certificateId": "CERT-...",
      "issuedAt": "2026-03-03T10:00:00Z",
      "completedAt": "2026-03-03T09:00:00Z"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid filter parameters",
  "errors": ["minDuration must be a number"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Course is not published"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch courses",
  "error": "Error details"
}
```

## Testing

### Run Property Tests
```bash
npm test -- course-endpoints.property.test.js
```

### Run Unit Tests
```bash
npm test -- course-controller.unit.test.js
```

### Run All Course Tests
```bash
npm test -- course
```

## Requirements Validation

- ✅ **Requirements 1.1-1.7**: Advanced filtering and search
- ✅ **Requirements 2.1-2.7**: Comprehensive course information
- ✅ **Requirements 4.1-4.5**: Free preview functionality
- ✅ **Requirements 6.1-6.6**: Progress tracking and continuation
- ✅ **Requirements 7.1-7.6**: Smart search and sorting
- ✅ **Requirements 11.2**: Integration with notification system
- ✅ **Requirements 12.6**: Pagination support

## Notes

- All endpoints use proper error handling
- Authentication is handled by the `protect` middleware
- Pagination defaults to 12 items per page
- Preview views are tracked automatically
- Certificate generation is automatic upon course completion
- Enrollment stats are updated in real-time
