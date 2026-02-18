# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Users

#### Register User
- **URL:** `POST /users/register`
- **Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "Admin|HR|Manager|Employee|Applicant",
  "department": "string",
  "position": "string"
}
```
- **Response:** User object + JWT token

#### Login
- **URL:** `POST /users/login`
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response:** User object + JWT token

#### Get Profile
- **URL:** `GET /users/profile`
- **Auth:** Required
- **Response:** User object

#### Update Profile
- **URL:** `PUT /users/profile`
- **Auth:** Required
- **Body:** Any user fields to update

### Job Postings

#### Create Job Posting
- **URL:** `POST /job-postings`
- **Auth:** Required (HR, Manager, Admin)
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "requirements": "string",
  "location": "string",
  "jobType": "Full-time|Part-time|Contract|Temporary",
  "department": "string",
  "salary": {
    "min": "number",
    "max": "number"
  }
}
```

#### Get All Job Postings
- **URL:** `GET /job-postings`
- **Query Params:** 
  - `status` - Open, Closed, On Hold
  - `department` - Filter by department
- **Response:** Array of job postings

#### Get Job Posting
- **URL:** `GET /job-postings/:id`
- **Response:** Job posting with applicants

#### Update Job Posting
- **URL:** `PUT /job-postings/:id`
- **Auth:** Required (HR, Manager, Admin)
- **Body:** Fields to update

#### Delete Job Posting
- **URL:** `DELETE /job-postings/:id`
- **Auth:** Required (HR, Admin)

### Job Applications

#### Apply for Job
- **URL:** `POST /job-applications`
- **Auth:** Required
- **Body:**
```json
{
  "jobPostingId": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "resume": "string",
  "coverLetter": "string",
  "experience": "number",
  "qualifications": ["string"]
}
```

#### Get Applications for Job
- **URL:** `GET /job-applications/job/:jobPostingId`
- **Auth:** Required (HR, Manager, Admin)

#### Get My Applications
- **URL:** `GET /job-applications/my-applications`
- **Auth:** Required

#### Update Application Status
- **URL:** `PUT /job-applications/:id/status`
- **Auth:** Required (HR, Manager, Admin)
- **Body:**
```json
{
  "status": "Pending|Reviewed|Shortlisted|Rejected|Accepted"
}
```

### Educational Courses

#### Create Course
- **URL:** `POST /educational-courses`
- **Auth:** Required (HR, Admin)
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "level": "Beginner|Intermediate|Advanced",
  "duration": {
    "value": "number",
    "unit": "hours|days|weeks"
  },
  "maxParticipants": "number",
  "startDate": "date",
  "endDate": "date"
}
```

#### Get All Courses
- **URL:** `GET /educational-courses`

#### Get Course
- **URL:** `GET /educational-courses/:id`

#### Enroll in Course
- **URL:** `POST /educational-courses/:id/enroll`
- **Auth:** Required

#### Update Course
- **URL:** `PUT /educational-courses/:id`
- **Auth:** Required (HR, Admin)

### Training Courses

#### Create Training Course
- **URL:** `POST /training-courses`
- **Auth:** Required (HR, Manager, Admin)
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "objective": "string",
  "department": "string",
  "skillsFocused": ["string"],
  "duration": {
    "value": "number",
    "unit": "hours|days|weeks"
  },
  "schedule": {
    "startDate": "date",
    "endDate": "date",
    "frequency": "string"
  },
  "budget": "number"
}
```

#### Get All Training Courses
- **URL:** `GET /training-courses`

#### Get Training Course
- **URL:** `GET /training-courses/:id`

#### Enroll Trainee
- **URL:** `POST /training-courses/:id/enroll`
- **Auth:** Required (HR, Manager, Admin)
- **Body:**
```json
{
  "employeeId": "string"
}
```

#### Update Course Status
- **URL:** `PUT /training-courses/:id/status`
- **Auth:** Required (HR, Manager, Admin)
- **Body:**
```json
{
  "status": "Planned|In Progress|Completed|Cancelled"
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
