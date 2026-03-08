# API Documentation - Enhanced Job Postings

This document provides details about the new API endpoints introduced for the Enhanced Job Postings feature.

## 1. Bookmarks

### Toggle Bookmark
`POST /api/job-postings/:id/bookmark`
- **Auth**: Required
- **Description**: Adds or removes a job from the user's bookmarks.
- **Response**:
```json
{
  "success": true,
  "data": { "bookmarked": true },
  "message": "Job added to bookmarks"
}
```

### Get Bookmarked Jobs
`GET /api/job-postings/bookmarked`
- **Auth**: Required
- **Description**: Returns a paginated list of jobs bookmarked by the user.
- **Query Params**: `page`, `limit`

## 2. Sharing

### Record Share
`POST /api/job-postings/:id/share`
- **Auth**: Optional
- **Body**: `{ "platform": "whatsapp" | "linkedin" | "twitter" | "facebook" | "copy_link" }`
- **Description**: Records that a job was shared on a specific platform.

## 3. Recommendations & Data

### Get Similar Jobs
`GET /api/job-postings/:id/similar`
- **Description**: Returns jobs similar to the specified job based on skills, type, and location.
- **Query Params**: `limit` (default: 5)

### Get Salary Estimate
`GET /api/job-postings/:id/salary-estimate`
- **Description**: Returns market comparison data for the job's salary.

## 4. Company Info

### Get Enhanced Company Info
`GET /api/companies/:id/info`
- **Description**: Returns extended information about a company including logo, size, response rate, and ratings.
