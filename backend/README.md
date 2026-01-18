# HR Management System Backend

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB URI
- JWT Secret
- Port

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Job Postings
- `POST /api/job-postings` - Create job posting (HR/Manager only)
- `GET /api/job-postings` - Get all job postings
- `GET /api/job-postings/:id` - Get specific job posting
- `PUT /api/job-postings/:id` - Update job posting
- `DELETE /api/job-postings/:id` - Delete job posting

### Job Applications
- `POST /api/job-applications` - Apply for job
- `GET /api/job-applications/job/:jobPostingId` - Get applications for job
- `GET /api/job-applications/my-applications` - Get my applications
- `PUT /api/job-applications/:id/status` - Update application status

### Educational Courses
- `POST /api/educational-courses` - Create course
- `GET /api/educational-courses` - Get all courses
- `GET /api/educational-courses/:id` - Get specific course
- `POST /api/educational-courses/:id/enroll` - Enroll in course
- `PUT /api/educational-courses/:id` - Update course

### Training Courses
- `POST /api/training-courses` - Create training course
- `GET /api/training-courses` - Get all training courses
- `GET /api/training-courses/:id` - Get specific training course
- `POST /api/training-courses/:id/enroll` - Enroll trainee
- `PUT /api/training-courses/:id/status` - Update course status
