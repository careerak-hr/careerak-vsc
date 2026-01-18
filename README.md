# HR Management System

A comprehensive Human Resources Management System built with Node.js/Express backend and React frontend.

## Features

### 1. **Job Management**
- 📋 Post job openings with detailed requirements and descriptions
- 👥 Manage job applications from candidates
- 📊 Track application status (Pending, Reviewed, Shortlisted, Rejected, Accepted)
- 🔍 Filter and search job postings

### 2. **Educational Courses**
- 📚 Create and publish educational courses for employees
- 👨‍🎓 Employee enrollment and course completion tracking
- 📋 Course categories and skill levels (Beginner, Intermediate, Advanced)
- 🎯 Track course participation and completion

### 3. **Training Courses**
- 🎓 Manage departmental training programs
- 👥 Enroll employees in training courses
- 📈 Track trainee progress and completion status
- 💰 Budget management for training programs

### 4. **User Management**
- 🔐 User authentication with JWT tokens
- 👤 Different roles: Admin, HR, Manager, Employee, Applicant
- 📝 User profile management
- 🔒 Secure password hashing with bcryptjs

## Project Structure

```
Careerak-vsc/
├── backend/
│   ├── src/
│   │   ├── models/          # Database schemas
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   ├── config/          # Database configuration
│   │   └── index.js         # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx
│   ├── package.json
│   └── public/
└── docs/                     # Documentation
```

## Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key
- `PORT` - Server port (default: 5000)

Start the server:
```bash
npm run dev  # Development with nodemon
npm start   # Production
```

### Frontend Setup

```bash
cd frontend
npm install
npm start   # Starts on port 3000
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update profile (requires token)

### Job Postings
- `POST /api/job-postings` - Create job posting
- `GET /api/job-postings` - Get all job postings
- `GET /api/job-postings/:id` - Get specific job posting
- `PUT /api/job-postings/:id` - Update job posting
- `DELETE /api/job-postings/:id` - Delete job posting

### Job Applications
- `POST /api/job-applications` - Apply for job
- `GET /api/job-applications/job/:jobPostingId` - Get applications for a job
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

## Technology Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router
- Axios for HTTP requests
- Tailwind CSS for styling

## Database Models

1. **User** - System users with roles and departments
2. **JobPosting** - Job opening information
3. **JobApplication** - Application records and status tracking
4. **EducationalCourse** - Educational course details
5. **TrainingCourse** - Internal training programs

## User Roles

- **Admin** - Full system access
- **HR** - HR department operations
- **Manager** - Department management
- **Employee** - Regular employee
- **Applicant** - Job applicants

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcryptjs
- CORS protection
- Environment variable configuration

## Future Enhancements

- [ ] Email notifications for job applications
- [ ] Resume upload and storage
- [ ] Advanced analytics and reporting
- [ ] Real-time notifications
- [ ] Document management
- [ ] Interview scheduling
- [ ] Performance reviews
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License

## Support

For issues or questions, please contact the HR department.
