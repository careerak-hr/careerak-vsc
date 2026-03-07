# Wishlist API Documentation

## Overview

The Wishlist API allows users to save courses they're interested in for later viewing. Each user has one wishlist that can contain multiple courses with optional notes.

**Requirements**: 8.1, 8.2, 8.3

## Authentication

All wishlist endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get User's Wishlist

**GET** `/wishlist`

Returns the user's wishlist with populated course details.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "wishlist": {
      "_id": "wishlist_id",
      "user": "user_id",
      "courses": [
        {
          "course": {
            "_id": "course_id",
            "title": "Introduction to React",
            "description": "Learn React from scratch",
            "thumbnail": "https://...",
            "price": {
              "amount": 99,
              "currency": "USD",
              "isFree": false
            },
            "level": "Beginner",
            "totalDuration": 10,
            "totalLessons": 25,
            "stats": {
              "totalEnrollments": 1500,
              "averageRating": 4.7,
              "totalReviews": 320
            },
            "badges": [
              {
                "type": "most_popular",
                "awardedAt": "2024-01-15T10:00:00.000Z"
              }
            ],
            "category": "Programming",
            "instructor": {
              "_id": "instructor_id",
              "fullName": "John Doe",
              "profilePicture": "https://..."
            }
          },
          "addedAt": "2024-02-20T14:30:00.000Z",
          "notes": "Want to learn this for my next project"
        }
      ],
      "courseCount": 1
    },
    "count": 1
  }
}
```

---

### 2. Add Course to Wishlist

**POST** `/wishlist/:courseId`

Adds a course to the user's wishlist. If the course is already in the wishlist, updates the notes if provided.

**URL Parameters**:
- `courseId` (required): The ID of the course to add

**Request Body**:
```json
{
  "notes": "Optional notes about why you want to take this course"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Course added to wishlist successfully",
  "data": {
    "wishlist": {
      // Full wishlist object
    },
    "addedCourse": {
      "course": {
        // Course details
      },
      "addedAt": "2024-02-20T14:30:00.000Z",
      "notes": "Optional notes"
    }
  }
}
```

**Response** (200 OK) - If course already in wishlist:
```json
{
  "success": true,
  "message": "Course already in wishlist",
  "data": {
    "wishlist": {
      // Full wishlist object
    },
    "addedCourse": {
      // Updated course item
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Course does not exist
- `400 Bad Request`: Course is not published

---

### 3. Remove Course from Wishlist

**DELETE** `/wishlist/:courseId`

Removes a course from the user's wishlist.

**URL Parameters**:
- `courseId` (required): The ID of the course to remove

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Course removed from wishlist successfully",
  "data": {
    "wishlist": {
      // Updated wishlist object
    },
    "count": 5
  }
}
```

**Error Responses**:
- `404 Not Found`: Wishlist not found or course not in wishlist

---

### 4. Update Wishlist Notes

**POST** `/wishlist/:courseId/notes`

Updates the notes for a course in the wishlist.

**URL Parameters**:
- `courseId` (required): The ID of the course

**Request Body**:
```json
{
  "notes": "Updated notes (max 500 characters)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notes updated successfully",
  "data": {
    "wishlistItem": {
      "course": {
        // Course details
      },
      "addedAt": "2024-02-20T14:30:00.000Z",
      "notes": "Updated notes"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Notes field missing or exceeds 500 characters
- `404 Not Found`: Wishlist not found or course not in wishlist

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get wishlist
const getWishlist = async () => {
  const response = await fetch('/wishlist', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.wishlist;
};

// Add to wishlist
const addToWishlist = async (courseId, notes = '') => {
  const response = await fetch(`/wishlist/${courseId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes })
  });
  return await response.json();
};

// Remove from wishlist
const removeFromWishlist = async (courseId) => {
  const response = await fetch(`/wishlist/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Update notes
const updateNotes = async (courseId, notes) => {
  const response = await fetch(`/wishlist/${courseId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes })
  });
  return await response.json();
};
```

### React Hook Example

```jsx
import { useState, useEffect } from 'react';

const useWishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setWishlist(data.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (courseId, notes = '') => {
    try {
      const response = await fetch(`/wishlist/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      const data = await response.json();
      setWishlist(data.data.wishlist);
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      const response = await fetch(`/wishlist/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setWishlist(data.data.wishlist);
      return data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const updateNotes = async (courseId, notes) => {
    try {
      const response = await fetch(`/wishlist/${courseId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      const data = await response.json();
      await fetchWishlist(); // Refresh wishlist
      return data;
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  };

  const isInWishlist = (courseId) => {
    if (!wishlist) return false;
    return wishlist.courses.some(
      item => item.course._id === courseId
    );
  };

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    updateNotes,
    isInWishlist,
    refresh: fetchWishlist
  };
};

export default useWishlist;
```

## Business Rules

1. **One Wishlist Per User**: Each user has exactly one wishlist
2. **No Duplicates**: Adding the same course twice updates the existing entry
3. **Published Courses Only**: Only published courses can be added to wishlist
4. **Notes Limit**: Notes are limited to 500 characters
5. **Automatic Cleanup**: Deleted courses are filtered out when retrieving wishlist
6. **User Isolation**: Users can only access their own wishlist

## Testing

### Property Tests
Run property-based tests to verify universal properties:
```bash
npm test -- wishlist-endpoints.property.test.js
```

Properties tested:
- Property 24: Wishlist Add Operation
- Property 25: Wishlist Remove Operation
- Property 26: Wishlist Retrieval
- Property 27: Notes Update Operation
- Property 28: Wishlist Isolation

### Unit Tests
Run unit tests for specific functionality:
```bash
npm test -- wishlist-controller.unit.test.js
```

## Performance Considerations

- Wishlist queries use indexes on `user` and `courses.course` fields
- Course details are populated efficiently using Mongoose populate
- Deleted courses are filtered out to prevent null references
- Large wishlists (100+ courses) are supported and tested

## Security

- All endpoints require authentication
- Users can only access their own wishlist
- Course IDs are validated before operations
- Notes are sanitized and length-limited
- MongoDB injection protection via mongoose

## Related Models

- **Wishlist**: `backend/src/models/Wishlist.js`
- **EducationalCourse**: `backend/src/models/EducationalCourse.js`
- **User**: `backend/src/models/User.js`

## Related Files

- **Controller**: `backend/src/controllers/wishlistController.js`
- **Routes**: `backend/src/routes/wishlistRoutes.js`
- **Property Tests**: `backend/tests/wishlist-endpoints.property.test.js`
- **Unit Tests**: `backend/tests/wishlist-controller.unit.test.js`
