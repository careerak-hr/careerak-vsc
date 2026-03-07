# API Documentation: Apply Page Enhancements

## Overview

This document provides comprehensive API documentation for the Apply Page Enhancements feature. All endpoints require authentication unless otherwise specified.

## Table of Contents

- [Authentication](#authentication)
- [Draft Management](#draft-management)
- [Application Submission](#application-submission)
- [File Management](#file-management)
- [Status Management](#status-management)
- [Error Codes](#error-codes)

---

## Authentication

All API endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Authentication Errors:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions

---

## Draft Management

### Create or Update Draft

Save application progress as a draft.

**Endpoint:** `POST /api/applications/drafts`

**Authentication:** Required (Employee only)

**Request Body:**

```json
{
  "jobPostingId": "string (required)",
  "step": "number (required, 1-5)",
  "formData": {
    "fullName": "string (optional)",
    "email": "string (optional)",
    "phone": "string (optional)",
    "country": "string (optional)",
    "city": "string (optional)",
    "education": [
      {
        "level": "string",
        "degree": "string",
        "institution": "string",
        "city": "string",
        "country": "string",
        "year": "string",
        "grade": "string"
      }
    ],
    "experience": [
      {
        "company": "string",
        "position": "string",
        "from": "date",
        "to": "date",
        "current": "boolean",
        "tasks": "string",
        "workType": "string",
        "jobLevel": "string",
        "country": "string",
        "city": "string"
      }
    ],
    "computerSkills": [
      {
        "skill": "string",
        "proficiency": "string"
      }
    ],
    "softwareSkills": [
      {
        "software": "string",
        "proficiency": "string"
      }
    ],
    "otherSkills": ["string"],
    "languages": [
      {
        "language": "string",
        "proficiency": "string"
      }
    ],
    "coverLetter": "string (optional)",
    "expectedSalary": "number (optional)",
    "availableFrom": "date (optional)",
    "noticePeriod": "string (optional)"
  },
  "files": [
    {
      "id": "string",
      "name": "string",
      "size": "number",
      "type": "string",
      "url": "string",
      "cloudinaryId": "string",
      "category": "string (resume|cover_letter|certificate|portfolio|other)",
      "uploadedAt": "date"
    }
  ],
  "customAnswers": [
    {
      "questionId": "string",
      "questionText": "string",
      "questionType": "string",
      "answer": "any"
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "draftId": "string",
    "savedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example Request:**

```javascript
const response = await fetch('/api/applications/drafts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobPostingId: '507f1f77bcf86cd799439011',
    step: 2,
    formData: {
      fullName: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      education: [
        {
          level: 'Bachelor',
          degree: 'Computer Science',
          institution: 'King Saud University',
          year: '2020',
          grade: 'Excellent'
        }
      ]
    },
    files: []
  })
});

const result = await response.json();
console.log('Draft saved:', result.data.draftId);
```

**Error Responses:**

- `400 Bad Request`: Invalid data format
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Job posting not found
- `500 Internal Server Error`: Server error

---

### Get Draft

Retrieve a saved draft for a specific job posting.

**Endpoint:** `GET /api/applications/drafts/:jobPostingId`

**Authentication:** Required (Employee only)

**URL Parameters:**
- `jobPostingId` (string, required): The ID of the job posting

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "draftId": "string",
    "jobPostingId": "string",
    "step": "number",
    "formData": {
      // Same structure as create/update
    },
    "files": [
      // Array of file objects
    ],
    "customAnswers": [
      // Array of custom answers
    ],
    "savedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "DRAFT_NOT_FOUND",
    "message": "No draft found for this job posting"
  }
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/drafts/507f1f77bcf86cd799439011`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
if (result.success) {
  console.log('Draft loaded:', result.data);
} else {
  console.log('No draft found');
}
```

---

### Delete Draft

Delete a saved draft.

**Endpoint:** `DELETE /api/applications/drafts/:draftId`

**Authentication:** Required (Employee only)

**URL Parameters:**
- `draftId` (string, required): The ID of the draft to delete

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/drafts/507f1f77bcf86cd799439012`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log(result.message);
```

**Error Responses:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the draft owner
- `404 Not Found`: Draft not found
- `500 Internal Server Error`: Server error

---

## Application Submission

### Submit Application

Submit a final job application.

**Endpoint:** `POST /api/applications`

**Authentication:** Required (Employee only)

**Request Body:**

```json
{
  "jobPostingId": "string (required)",
  "formData": {
    "fullName": "string (required)",
    "email": "string (required)",
    "phone": "string (required)",
    "country": "string (optional)",
    "city": "string (optional)",
    "education": [
      // Array of education objects (required, min 1)
    ],
    "experience": [
      // Array of experience objects (optional)
    ],
    "computerSkills": [
      // Array of skill objects (optional)
    ],
    "softwareSkills": [
      // Array of skill objects (optional)
    ],
    "otherSkills": [
      // Array of strings (optional)
    ],
    "languages": [
      // Array of language objects (required, min 1)
    ],
    "coverLetter": "string (optional)",
    "expectedSalary": "number (optional)",
    "availableFrom": "date (optional)",
    "noticePeriod": "string (optional)"
  },
  "files": [
    // Array of file objects (required, min 1 - resume)
  ],
  "customAnswers": [
    // Array of custom question answers
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "applicationId": "string",
    "status": "Submitted",
    "submittedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Application submitted successfully"
}
```

**Example Request:**

```javascript
const response = await fetch('/api/applications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobPostingId: '507f1f77bcf86cd799439011',
    formData: {
      fullName: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      education: [
        {
          level: 'Bachelor',
          degree: 'Computer Science',
          institution: 'King Saud University',
          year: '2020',
          grade: 'Excellent'
        }
      ],
      languages: [
        { language: 'Arabic', proficiency: 'Native' },
        { language: 'English', proficiency: 'Advanced' }
      ],
      coverLetter: 'I am excited to apply...'
    },
    files: [
      {
        id: 'file_123',
        name: 'resume.pdf',
        size: 245678,
        type: 'application/pdf',
        url: 'https://res.cloudinary.com/...',
        cloudinaryId: 'careerak/resumes/file_123',
        category: 'resume',
        uploadedAt: '2024-01-15T10:45:00.000Z'
      }
    ],
    customAnswers: [
      {
        questionId: 'q1',
        questionText: 'Why do you want to work here?',
        questionType: 'long_text',
        answer: 'I am passionate about...'
      }
    ]
  })
});

const result = await response.json();
console.log('Application submitted:', result.data.applicationId);
```

**Error Responses:**

- `400 Bad Request`: Validation errors (missing required fields, invalid data)
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Job posting not found
- `409 Conflict`: Already applied to this job
- `500 Internal Server Error`: Server error

**Validation Error Example:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "formData.fullName",
        "message": "Full name is required"
      },
      {
        "field": "files",
        "message": "At least one file (resume) is required"
      }
    ]
  }
}
```

---

### Get Application Details

Retrieve details of a submitted application.

**Endpoint:** `GET /api/applications/:applicationId`

**Authentication:** Required (Employee or Employer)

**URL Parameters:**
- `applicationId` (string, required): The ID of the application

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "applicationId": "string",
    "jobPosting": {
      "id": "string",
      "title": "string",
      "company": {
        "id": "string",
        "name": "string",
        "logo": "string"
      }
    },
    "applicant": {
      "id": "string",
      "name": "string",
      "email": "string",
      "profilePicture": "string"
    },
    "formData": {
      // Complete form data
    },
    "files": [
      // Array of uploaded files
    ],
    "customAnswers": [
      // Array of custom question answers
    ],
    "status": "string",
    "statusHistory": [
      {
        "status": "string",
        "timestamp": "date",
        "note": "string (optional)",
        "updatedBy": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "submittedAt": "date",
    "reviewedAt": "date (optional)",
    "withdrawnAt": "date (optional)",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/507f1f77bcf86cd799439013`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log('Application:', result.data);
```

**Error Responses:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this application
- `404 Not Found`: Application not found
- `500 Internal Server Error`: Server error

---

### Get User Applications

Retrieve all applications for the authenticated user.

**Endpoint:** `GET /api/applications/user/me`

**Authentication:** Required (Employee only)

**Query Parameters:**
- `status` (string, optional): Filter by status
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `sort` (string, optional): Sort field (default: -submittedAt)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "string",
        "jobPosting": {
          "id": "string",
          "title": "string",
          "company": {
            "name": "string",
            "logo": "string"
          }
        },
        "status": "string",
        "submittedAt": "date",
        "updatedAt": "date"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10
    }
  }
}
```

**Example Request:**

```javascript
const response = await fetch(
  '/api/applications/user/me?status=Submitted&page=1&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log('Applications:', result.data.applications);
```

---

### Withdraw Application

Withdraw a submitted application.

**Endpoint:** `PATCH /api/applications/:applicationId/withdraw`

**Authentication:** Required (Employee only)

**URL Parameters:**
- `applicationId` (string, required): The ID of the application

**Request Body:**

```json
{
  "reason": "string (optional)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "applicationId": "string",
    "status": "Withdrawn",
    "withdrawnAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Application withdrawn successfully"
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/507f1f77bcf86cd799439013/withdraw`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason: 'Accepted another offer'
    })
  }
);

const result = await response.json();
console.log(result.message);
```

**Error Responses:**

- `400 Bad Request`: Cannot withdraw (status not Pending or Reviewed)
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the application owner
- `404 Not Found`: Application not found
- `500 Internal Server Error`: Server error

**Cannot Withdraw Example:**

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_WITHDRAW",
    "message": "Cannot withdraw application with status 'Shortlisted'"
  }
}
```

---

## File Management

### Upload File

Upload a file to Cloudinary.

**Endpoint:** `POST /api/applications/files/upload`

**Authentication:** Required (Employee only)

**Request:** Multipart form data

**Form Fields:**
- `file` (file, required): The file to upload
- `category` (string, required): File category (resume|cover_letter|certificate|portfolio|other)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "size": "number",
    "type": "string",
    "url": "string",
    "cloudinaryId": "string",
    "category": "string",
    "uploadedAt": "date"
  }
}
```

**Example Request:**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'resume');

const response = await fetch('/api/applications/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('File uploaded:', result.data.url);
```

**Error Responses:**

- `400 Bad Request`: Invalid file (type, size, missing file)
- `401 Unauthorized`: Not authenticated
- `413 Payload Too Large`: File exceeds 5MB
- `500 Internal Server Error`: Upload failed

**Validation Error Example:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type 'text/plain' is not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG"
  }
}
```

---

### Delete File

Delete a file from Cloudinary.

**Endpoint:** `DELETE /api/applications/files/:cloudinaryId`

**Authentication:** Required (Employee only)

**URL Parameters:**
- `cloudinaryId` (string, required): The Cloudinary ID of the file

**Response (200 OK):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Example Request:**

```javascript
const cloudinaryId = encodeURIComponent('careerak/resumes/file_123');
const response = await fetch(
  `/api/applications/files/${cloudinaryId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log(result.message);
```

**Error Responses:**

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: File not found
- `500 Internal Server Error`: Deletion failed

---

## Status Management

### Update Application Status

Update the status of an application (HR/Employer only).

**Endpoint:** `PATCH /api/applications/:applicationId/status`

**Authentication:** Required (Employer only)

**URL Parameters:**
- `applicationId` (string, required): The ID of the application

**Request Body:**

```json
{
  "status": "string (required)",
  "note": "string (optional)"
}
```

**Valid Status Values:**
- `Reviewed`
- `Shortlisted`
- `Interview Scheduled`
- `Accepted`
- `Rejected`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "applicationId": "string",
    "status": "string",
    "updatedAt": "date"
  },
  "message": "Application status updated successfully"
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/507f1f77bcf86cd799439013/status`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'Shortlisted',
      note: 'Impressive qualifications'
    })
  }
);

const result = await response.json();
console.log(result.message);
```

**Error Responses:**

- `400 Bad Request`: Invalid status value
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized (not the employer)
- `404 Not Found`: Application not found
- `500 Internal Server Error`: Server error

---

### Get Status History

Get the complete status history of an application.

**Endpoint:** `GET /api/applications/:applicationId/status-history`

**Authentication:** Required (Employee or Employer)

**URL Parameters:**
- `applicationId` (string, required): The ID of the application

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "statusHistory": [
      {
        "status": "Submitted",
        "timestamp": "2024-01-15T11:00:00.000Z",
        "note": null,
        "updatedBy": {
          "id": "string",
          "name": "Ahmed Hassan"
        }
      },
      {
        "status": "Reviewed",
        "timestamp": "2024-01-16T09:30:00.000Z",
        "note": "Reviewing qualifications",
        "updatedBy": {
          "id": "string",
          "name": "HR Manager"
        }
      },
      {
        "status": "Shortlisted",
        "timestamp": "2024-01-17T14:00:00.000Z",
        "note": "Impressive qualifications",
        "updatedBy": {
          "id": "string",
          "name": "HR Manager"
        }
      }
    ]
  }
}
```

**Example Request:**

```javascript
const response = await fetch(
  `/api/applications/507f1f77bcf86cd799439013/status-history`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log('Status history:', result.data.statusHistory);
```

---

## Error Codes

### General Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for this action |
| `NOT_FOUND` | 404 | Requested resource not found |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Draft-Specific Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DRAFT_NOT_FOUND` | 404 | No draft found for the specified job posting |
| `INVALID_DRAFT_DATA` | 400 | Draft data validation failed |
| `DRAFT_SAVE_FAILED` | 500 | Failed to save draft to database |

### Application-Specific Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Application data validation failed |
| `ALREADY_APPLIED` | 409 | User has already applied to this job |
| `JOB_NOT_FOUND` | 404 | Job posting not found |
| `APPLICATION_NOT_FOUND` | 404 | Application not found |
| `CANNOT_WITHDRAW` | 400 | Cannot withdraw application in current status |
| `INVALID_STATUS` | 400 | Invalid status value provided |

### File-Specific Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `FILE_TOO_LARGE` | 413 | File exceeds maximum size (5MB) |
| `FILE_UPLOAD_FAILED` | 500 | Failed to upload file to Cloudinary |
| `FILE_DELETE_FAILED` | 500 | Failed to delete file from Cloudinary |
| `FILE_NOT_FOUND` | 404 | File not found in Cloudinary |
| `MAX_FILES_EXCEEDED` | 400 | Maximum number of files (10) exceeded |

### Status-Specific Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_STATUS_TRANSITION` | 400 | Invalid status transition |
| `STATUS_UPDATE_FAILED` | 500 | Failed to update application status |
| `NOT_EMPLOYER` | 403 | Only employers can update application status |

---

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Authenticated requests**: 100 requests per minute per user
- **File uploads**: 20 uploads per minute per user
- **Draft saves**: 60 saves per minute per user (auto-save friendly)

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

**Rate Limit Exceeded Response (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

---

## Webhooks (Optional)

For real-time status updates, the system uses Pusher. However, webhooks are also available for server-to-server notifications.

### Application Status Changed

**Event:** `application.status.changed`

**Payload:**

```json
{
  "event": "application.status.changed",
  "timestamp": "2024-01-15T14:00:00.000Z",
  "data": {
    "applicationId": "string",
    "jobPostingId": "string",
    "applicantId": "string",
    "oldStatus": "string",
    "newStatus": "string",
    "note": "string (optional)"
  }
}
```

### Application Submitted

**Event:** `application.submitted`

**Payload:**

```json
{
  "event": "application.submitted",
  "timestamp": "2024-01-15T11:00:00.000Z",
  "data": {
    "applicationId": "string",
    "jobPostingId": "string",
    "applicantId": "string",
    "applicantName": "string",
    "applicantEmail": "string"
  }
}
```

### Application Withdrawn

**Event:** `application.withdrawn`

**Payload:**

```json
{
  "event": "application.withdrawn",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "applicationId": "string",
    "jobPostingId": "string",
    "applicantId": "string",
    "reason": "string (optional)"
  }
}
```

---

## Best Practices

### 1. Error Handling

Always check the `success` field in responses:

```javascript
const response = await fetch('/api/applications/drafts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(draftData)
});

const result = await response.json();

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error.message);
  // Handle specific error codes
  if (result.error.code === 'VALIDATION_ERROR') {
    // Display validation errors to user
  }
}
```

### 2. Auto-Save Implementation

Implement debouncing for auto-save:

```javascript
let saveTimeout;

function autoSave(draftData) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      const response = await fetch('/api/applications/drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftData)
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Draft saved at:', result.data.savedAt);
      }
    } catch (error) {
      // Save to local storage as fallback
      localStorage.setItem(`draft_${jobPostingId}`, JSON.stringify(draftData));
    }
  }, 3000); // 3 seconds debounce
}
```

### 3. File Upload with Progress

Track upload progress:

```javascript
async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'resume');

  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100;
      onProgress(progress);
    }
  });

  return new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', '/api/applications/files/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}
```

### 4. Real-Time Status Updates

Subscribe to Pusher for real-time updates:

```javascript
import Pusher from 'pusher-js';

const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  encrypted: true
});

const channel = pusher.subscribe(`application-${applicationId}`);

channel.bind('status-updated', (data) => {
  console.log('Status updated:', data.newStatus);
  // Update UI with new status
  updateStatusTimeline(data);
});
```

---

## Changelog

### Version 1.0.0 (2024-01-15)

- Initial API release
- Draft management endpoints
- Application submission endpoints
- File upload/delete endpoints
- Status management endpoints
- Real-time updates via Pusher
- Comprehensive error handling

---

## Support

For API support or questions:
- Email: careerak.hr@gmail.com
- Documentation: https://docs.careerak.com
- Status Page: https://status.careerak.com
