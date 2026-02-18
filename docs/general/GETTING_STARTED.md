# Getting Started

## Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- npm or yarn package manager

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr_management
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend will open at `http://localhost:3000`

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Hamad",
    "email": "ahmed@example.com",
    "password": "password123",
    "role": "HR"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "password123"
  }'
```

### 3. Create Job Posting
```bash
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Senior Developer",
    "description": "We are looking for an experienced developer",
    "requirements": "5+ years of experience in Node.js",
    "location": "Dubai",
    "jobType": "Full-time",
    "department": "Engineering",
    "salary": {"min": 5000, "max": 8000}
  }'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Port Already in Use
- Change PORT in `.env` or `.env` (frontend proxy)

### CORS Error
- Backend has CORS enabled for development
- Check that API_URL in frontend matches backend URL

## Development Tips

1. Use Postman or Insomnia to test API endpoints
2. Check browser console for frontend errors
3. Use `npm run dev` in backend for automatic restart on file changes
4. Keep `.env` file in `.gitignore`

## Next Steps

1. Set up MongoDB Atlas for cloud database
2. Deploy backend to a server (Heroku, AWS, etc.)
3. Deploy frontend to static hosting (Vercel, Netlify, etc.)
4. Configure production environment variables
5. Set up CI/CD pipeline for automated deployments
