# Design Document: Courses Page Enhancements

## Overview

This design document outlines the technical architecture and implementation details for enhancing the Courses Page in the Careerak platform. The enhancements will transform the existing basic courses page into a comprehensive learning hub with advanced filtering, detailed course information, ratings and reviews, progress tracking, and improved user experience.

The system will extend the existing `EducationalCourse` model and integrate with the existing Review System, Notification System, and authentication infrastructure. The design follows the established patterns in the Careerak backend (Express.js, MongoDB, Mongoose) and frontend (React).

### Key Design Goals

1. **Extensibility**: Build on existing models without breaking current functionality
2. **Performance**: Ensure fast filtering and search with proper database indexing
3. **Integration**: Seamlessly integrate with existing Review and Notification systems
4. **User Experience**: Provide intuitive, responsive UI with RTL support
5. **Scalability**: Design for growing course catalog and user base

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  CoursesPage  │  CourseCard  │  CourseDetails  │  Filters   │
│  CoursePlayer │  ReviewForm  │  ProgressTracker │  Wishlist │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  courseController  │  courseReviewController                 │
│  courseEnrollmentController  │  courseProgressController     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│  courseService  │  filterService  │  badgeService            │
│  progressService  │  certificateService                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (MongoDB)                       │
├─────────────────────────────────────────────────────────────┤
│  EducationalCourse  │  CourseEnrollment  │  CourseProgress  │
│  CourseReview  │  CourseLesson  │  Wishlist                 │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

- **Review System**: Reuse existing Review model with new reviewType: 'course_review'
- **Notification System**: Send notifications for course updates, completions, new reviews
- **Authentication**: Use existing auth middleware for protected endpoints
- **File Upload**: Use existing Cloudinary integration for course materials

## Components and Interfaces

### Backend Models

#### 1. Enhanced EducationalCourse Model

Extends the existing model with new fields:

```javascript
{
  // Existing fields (preserved)
  title: String,
  description: String,
  content: String,
  instructor: ObjectId (ref: User),
  category: String,
  duration: { value: Number, unit: String },
  level: String (enum: Beginner/Intermediate/Advanced),
  maxParticipants: Number,
  enrolledParticipants: [ObjectId],
  status: String (enum: Draft/Published/Archived),
  startDate: Date,
  endDate: Date,
  
  // New fields for enhancements
  price: {
    amount: Number,
    currency: String (default: 'USD'),
    isFree: Boolean
  },
  
  topics: [String], // Main topics covered
  
  prerequisites: [String], // Required knowledge
  
  learningOutcomes: [String], // What students will learn
  
  totalLessons: Number, // Total number of lessons
  
  totalDuration: Number, // Total duration in hours
  
  thumbnail: String, // Course image URL
  
  previewVideo: String, // Preview video URL
  
  syllabus: [{
    section: String,
    lessons: [{
      title: String,
      duration: Number, // in minutes
      isFree: Boolean // Free preview
    }]
  }],
  
  instructorInfo: {
    bio: String,
    credentials: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String
    }
  },
  
  stats: {
    totalEnrollments: { type: Number, default: 0 },
    activeEnrollments: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // percentage
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    previewViews: { type: Number, default: 0 }
  },
  
  badges: [{
    type: String,
    enum: ['most_popular', 'new', 'recommended', 'top_rated'],
    awardedAt: Date
  }],
  
  settings: {
    allowReviews: { type: Boolean, default: true },
    certificateEnabled: { type: Boolean, default: true },
    autoEnroll: { type: Boolean, default: false }
  },
  
  publishedAt: Date,
  
  // Indexes for performance
  indexes: [
    { level: 1, category: 1 },
    { 'price.isFree': 1 },
    { 'stats.averageRating': -1 },
    { 'stats.totalEnrollments': -1 },
    { publishedAt: -1 },
    { status: 1 }
  ]
}
```

#### 2. CourseEnrollment Model (New)

```javascript
{
  course: { type: ObjectId, ref: 'EducationalCourse', required: true },
  student: { type: ObjectId, ref: 'User', required: true },
  
  enrolledAt: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'expired'],
    default: 'active'
  },
  
  progress: {
    completedLessons: [ObjectId], // Lesson IDs
    currentLesson: ObjectId,
    percentageComplete: { type: Number, default: 0 },
    lastAccessedAt: Date
  },
  
  completedAt: Date,
  
  certificateIssued: {
    issued: { type: Boolean, default: false },
    issuedAt: Date,
    certificateUrl: String,
    certificateId: String
  },
  
  payment: {
    amount: Number,
    currency: String,
    transactionId: String,
    paidAt: Date
  },
  
  // Indexes
  indexes: [
    { student: 1, course: 1 }, // unique
    { student: 1, status: 1 },
    { course: 1, status: 1 },
    { 'progress.lastAccessedAt': -1 }
  ]
}
```

#### 3. CourseLesson Model (New)

```javascript
{
  course: { type: ObjectId, ref: 'EducationalCourse', required: true },
  
  title: { type: String, required: true },
  
  description: String,
  
  order: { type: Number, required: true }, // Lesson sequence
  
  section: String, // Section/module name
  
  content: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment', 'resource'],
    required: true
  },
  
  videoUrl: String,
  
  textContent: String, // Markdown or HTML
  
  resources: [{
    title: String,
    url: String,
    type: String // pdf, doc, link, etc.
  }],
  
  duration: Number, // in minutes
  
  isFree: { type: Boolean, default: false }, // Free preview
  
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number, // index
      explanation: String
    }],
    passingScore: Number // percentage
  },
  
  // Indexes
  indexes: [
    { course: 1, order: 1 },
    { course: 1, isFree: 1 }
  ]
}
```

#### 4. CourseReview Model (Extends existing Review)

Reuse existing Review model with new reviewType:

```javascript
{
  reviewType: 'course_review', // New type
  
  reviewer: ObjectId (ref: User),
  
  course: ObjectId (ref: EducationalCourse), // Instead of reviewee
  
  enrollment: ObjectId (ref: CourseEnrollment),
  
  rating: Number (1-5),
  
  detailedRatings: {
    contentQuality: Number,
    instructorEffectiveness: Number,
    valueForMoney: Number,
    practicalApplication: Number
  },
  
  comment: String,
  title: String,
  pros: String,
  cons: String,
  
  wouldRecommend: Boolean,
  
  completionStatus: {
    type: String,
    enum: ['completed', 'in_progress', 'dropped']
  },
  
  // Reuse existing fields
  status: String,
  isAnonymous: Boolean,
  response: Object,
  helpfulCount: Number,
  notHelpfulCount: Number,
  helpfulBy: [ObjectId],
  reports: [Object]
}
```

#### 5. Wishlist Model (New)

```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  
  courses: [{
    course: { type: ObjectId, ref: 'EducationalCourse' },
    addedAt: { type: Date, default: Date.now },
    notes: String // User's personal notes
  }],
  
  // Indexes
  indexes: [
    { user: 1 }, // unique
    { 'courses.course': 1 }
  ]
}
```

### Backend Controllers

#### courseController.js

```javascript
// GET /courses - Get all courses with filters
async getCourses(req, res) {
  const {
    level,        // beginner/intermediate/advanced
    category,     // field/specialization
    minDuration,  // hours
    maxDuration,  // hours
    isFree,       // true/false
    minRating,    // 1-5
    search,       // search query
    sort,         // newest/popular/rating/price
    page,         // pagination
    limit,        // items per page
    view          // grid/list
  } = req.query;
  
  // Build filter query
  // Apply pagination
  // Return courses with stats
}

// GET /courses/:id - Get course details
async getCourseDetails(req, res) {
  // Return full course info
  // Include instructor details
  // Include syllabus
  // Include stats
}

// GET /courses/:id/preview - Get preview content
async getPreviewContent(req, res) {
  // Return first free lesson
  // Return syllabus outline
  // Increment preview view count
}

// POST /courses/:id/enroll - Enroll in course
async enrollInCourse(req, res) {
  // Create enrollment
  // Update course stats
  // Send notification
  // Handle payment if needed
}

// GET /courses/my-courses - Get user's enrolled courses
async getMyEnrolledCourses(req, res) {
  // Return user's enrollments
  // Include progress data
  // Sort by recent activity
}

// GET /courses/:id/progress - Get course progress
async getCourseProgress(req, res) {
  // Return enrollment with progress
  // Return next lesson
  // Return completion percentage
}

// POST /courses/:id/lessons/:lessonId/complete - Mark lesson complete
async markLessonComplete(req, res) {
  // Update enrollment progress
  // Check if course completed
  // Issue certificate if completed
  // Send notification
}

// GET /courses/:id/certificate - Get completion certificate
async getCertificate(req, res) {
  // Verify completion
  // Generate/retrieve certificate
  // Return certificate URL
}
```

#### courseReviewController.js

```javascript
// POST /courses/:id/reviews - Create course review
async createCourseReview(req, res) {
  // Verify enrollment
  // Check 50% completion
  // Create review using Review model
  // Update course stats
  // Send notification to instructor
}

// GET /courses/:id/reviews - Get course reviews
async getCourseReviews(req, res) {
  // Get reviews for course
  // Sort by helpful/recent
  // Include reviewer info (if not anonymous)
  // Paginate results
}

// GET /courses/:id/reviews/stats - Get review statistics
async getReviewStats(req, res) {
  // Return average rating
  // Return rating distribution
  // Return total reviews
  // Return completion rate
}

// PUT /courses/:id/reviews/:reviewId - Update review
async updateCourseReview(req, res) {
  // Verify ownership
  // Check edit window (24 hours)
  // Update review
  // Update course stats
}

// POST /courses/:id/reviews/:reviewId/helpful - Mark review helpful
async markReviewHelpful(req, res) {
  // Use existing Review model method
}

// POST /courses/:id/reviews/:reviewId/response - Instructor response
async respondToReview(req, res) {
  // Verify instructor ownership
  // Add response
  // Send notification to reviewer
}
```

#### wishlistController.js

```javascript
// GET /wishlist - Get user's wishlist
async getWishlist(req, res) {
  // Return user's wishlist
  // Populate course details
}

// POST /wishlist/:courseId - Add to wishlist
async addToWishlist(req, res) {
  // Add course to wishlist
  // Return updated wishlist
}

// DELETE /wishlist/:courseId - Remove from wishlist
async removeFromWishlist(req, res) {
  // Remove course
  // Return updated wishlist
}

// POST /wishlist/:courseId/notes - Add notes
async addWishlistNotes(req, res) {
  // Update course notes in wishlist
}
```

### Backend Services

#### filterService.js

```javascript
class FilterService {
  // Build MongoDB query from filter parameters
  buildFilterQuery(filters) {
    const query = { status: 'Published' };
    
    if (filters.level) {
      query.level = filters.level;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.minDuration || filters.maxDuration) {
      query.totalDuration = {};
      if (filters.minDuration) query.totalDuration.$gte = filters.minDuration;
      if (filters.maxDuration) query.totalDuration.$lte = filters.maxDuration;
    }
    
    if (filters.isFree !== undefined) {
      query['price.isFree'] = filters.isFree === 'true';
    }
    
    if (filters.minRating) {
      query['stats.averageRating'] = { $gte: parseFloat(filters.minRating) };
    }
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    return query;
  }
  
  // Build sort object
  buildSortObject(sortOption) {
    switch (sortOption) {
      case 'newest':
        return { publishedAt: -1 };
      case 'popular':
        return { 'stats.totalEnrollments': -1 };
      case 'rating':
        return { 'stats.averageRating': -1 };
      case 'price_low':
        return { 'price.amount': 1 };
      case 'price_high':
        return { 'price.amount': -1 };
      default:
        return { publishedAt: -1 };
    }
  }
}
```

#### badgeService.js

```javascript
class BadgeService {
  // Update course badges based on criteria
  async updateCourseBadges(courseId) {
    const course = await EducationalCourse.findById(courseId);
    const badges = [];
    
    // Most Popular: highest enrollment in category
    const topInCategory = await this.getTopEnrollmentInCategory(course.category);
    if (topInCategory._id.equals(courseId)) {
      badges.push({ type: 'most_popular', awardedAt: new Date() });
    }
    
    // New: published within last 30 days
    const daysSincePublish = (Date.now() - course.publishedAt) / (1000 * 60 * 60 * 24);
    if (daysSincePublish <= 30) {
      badges.push({ type: 'new', awardedAt: new Date() });
    }
    
    // Recommended: rating >= 4.5 and completion rate >= 70%
    if (course.stats.averageRating >= 4.5 && course.stats.completionRate >= 70) {
      badges.push({ type: 'recommended', awardedAt: new Date() });
    }
    
    // Top Rated: highest rating in category
    const topRatedInCategory = await this.getTopRatedInCategory(course.category);
    if (topRatedInCategory._id.equals(courseId)) {
      badges.push({ type: 'top_rated', awardedAt: new Date() });
    }
    
    // Update course
    course.badges = badges;
    await course.save();
    
    return badges;
  }
  
  async getTopEnrollmentInCategory(category) {
    // Query for highest enrollment
  }
  
  async getTopRatedInCategory(category) {
    // Query for highest rating
  }
}
```

#### progressService.js

```javascript
class ProgressService {
  // Calculate progress percentage
  calculateProgress(enrollment, course) {
    const totalLessons = course.totalLessons;
    const completedLessons = enrollment.progress.completedLessons.length;
    return Math.round((completedLessons / totalLessons) * 100);
  }
  
  // Mark lesson as complete
  async markLessonComplete(enrollmentId, lessonId) {
    const enrollment = await CourseEnrollment.findById(enrollmentId);
    
    if (!enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
    }
    
    const course = await EducationalCourse.findById(enrollment.course);
    enrollment.progress.percentageComplete = this.calculateProgress(enrollment, course);
    enrollment.progress.lastAccessedAt = new Date();
    
    // Check if course completed
    if (enrollment.progress.percentageComplete === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      
      // Issue certificate
      if (course.settings.certificateEnabled) {
        await this.issueCertificate(enrollment);
      }
      
      // Send notification
      await notificationService.sendCourseCompletionNotification(enrollment);
    }
    
    await enrollment.save();
    
    // Update course completion rate
    await this.updateCourseCompletionRate(course._id);
    
    return enrollment;
  }
  
  async issueCertificate(enrollment) {
    // Generate certificate
    // Upload to Cloudinary
    // Update enrollment
  }
  
  async updateCourseCompletionRate(courseId) {
    // Calculate completion rate from all enrollments
    // Update course stats
  }
}
```

#### certificateService.js

```javascript
class CertificateService {
  // Generate certificate PDF
  async generateCertificate(enrollment) {
    const course = await EducationalCourse.findById(enrollment.course).populate('instructor');
    const student = await User.findById(enrollment.student);
    
    const certificateData = {
      studentName: student.fullName,
      courseName: course.title,
      instructorName: course.instructor.fullName,
      completionDate: enrollment.completedAt,
      certificateId: this.generateCertificateId(enrollment),
      duration: course.totalDuration
    };
    
    // Generate PDF using template
    const pdfBuffer = await this.createPDF(certificateData);
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(pdfBuffer, {
      folder: 'certificates',
      resource_type: 'raw'
    });
    
    return {
      certificateUrl: uploadResult.secure_url,
      certificateId: certificateData.certificateId
    };
  }
  
  generateCertificateId(enrollment) {
    // Generate unique ID: CERT-{courseId}-{studentId}-{timestamp}
    return `CERT-${enrollment.course}-${enrollment.student}-${Date.now()}`;
  }
  
  async createPDF(data) {
    // Use PDF library to create certificate
    // Return buffer
  }
}
```

### Frontend Components

#### CoursesPage.jsx

```jsx
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid'); // grid or list
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetchCourses();
  }, [filters, sort, page]);
  
  const fetchCourses = async () => {
    // API call with filters
  };
  
  return (
    <div className="courses-page">
      <CourseFilters filters={filters} onChange={setFilters} />
      <CourseSortBar sort={sort} onSortChange={setSort} view={view} onViewChange={setView} />
      <CourseGrid courses={courses} view={view} />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
};
```

#### CourseCard.jsx

```jsx
const CourseCard = ({ course, view }) => {
  const { language } = useApp();
  
  return (
    <div className={`course-card ${view}`}>
      <img src={course.thumbnail} alt={course.title} />
      
      {/* Badges */}
      <div className="badges">
        {course.badges.map(badge => (
          <Badge key={badge.type} type={badge.type} />
        ))}
      </div>
      
      {/* Course Info */}
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      
      {/* Stats */}
      <div className="stats">
        <Rating value={course.stats.averageRating} />
        <span>({course.stats.totalReviews} reviews)</span>
        <span>{course.stats.totalEnrollments} students</span>
      </div>
      
      {/* Details */}
      <div className="details">
        <span>{course.level}</span>
        <span>{course.totalDuration}h</span>
        <span>{course.totalLessons} lessons</span>
      </div>
      
      {/* Price */}
      <div className="price">
        {course.price.isFree ? 'Free' : `$${course.price.amount}`}
      </div>
      
      {/* Actions */}
      <div className="actions">
        <button onClick={() => navigate(`/courses/${course._id}`)}>
          View Details
        </button>
        <WishlistButton courseId={course._id} />
      </div>
    </div>
  );
};
```

#### CourseFilters.jsx

```jsx
const CourseFilters = ({ filters, onChange }) => {
  return (
    <div className="course-filters">
      {/* Level Filter */}
      <FilterGroup label="Level">
        <Checkbox value="Beginner" checked={filters.level === 'Beginner'} onChange={...} />
        <Checkbox value="Intermediate" checked={filters.level === 'Intermediate'} onChange={...} />
        <Checkbox value="Advanced" checked={filters.level === 'Advanced'} onChange={...} />
      </FilterGroup>
      
      {/* Category Filter */}
      <FilterGroup label="Category">
        <Select options={categories} value={filters.category} onChange={...} />
      </FilterGroup>
      
      {/* Duration Filter */}
      <FilterGroup label="Duration">
        <RangeSlider min={0} max={100} value={[filters.minDuration, filters.maxDuration]} onChange={...} />
      </FilterGroup>
      
      {/* Price Filter */}
      <FilterGroup label="Price">
        <Radio value="all" checked={!filters.isFree} onChange={...}>All</Radio>
        <Radio value="free" checked={filters.isFree === 'true'} onChange={...}>Free</Radio>
        <Radio value="paid" checked={filters.isFree === 'false'} onChange={...}>Paid</Radio>
      </FilterGroup>
      
      {/* Rating Filter */}
      <FilterGroup label="Minimum Rating">
        <StarRating value={filters.minRating} onChange={...} />
      </FilterGroup>
      
      {/* Clear Filters */}
      <button onClick={() => onChange({})}>Clear All</button>
    </div>
  );
};
```

#### CourseDetailsPage.jsx

```jsx
const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [courseId]);
  
  return (
    <div className="course-details-page">
      {/* Hero Section */}
      <CourseHero course={course} enrollment={enrollment} />
      
      {/* Tabs */}
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab id="overview">Overview</Tab>
        <Tab id="curriculum">Curriculum</Tab>
        <Tab id="instructor">Instructor</Tab>
        <Tab id="reviews">Reviews</Tab>
      </Tabs>
      
      {/* Tab Content */}
      {activeTab === 'overview' && <CourseOverview course={course} />}
      {activeTab === 'curriculum' && <CourseCurriculum course={course} enrollment={enrollment} />}
      {activeTab === 'instructor' && <InstructorInfo instructor={course.instructor} />}
      {activeTab === 'reviews' && <CourseReviews courseId={courseId} />}
    </div>
  );
};
```

#### ProgressTracker.jsx

```jsx
const ProgressTracker = ({ enrollment, course }) => {
  return (
    <div className="progress-tracker">
      <h3>Your Progress</h3>
      
      {/* Progress Bar */}
      <ProgressBar percentage={enrollment.progress.percentageComplete} />
      
      {/* Stats */}
      <div className="stats">
        <span>{enrollment.progress.completedLessons.length} / {course.totalLessons} lessons</span>
        <span>{enrollment.progress.percentageComplete}% complete</span>
      </div>
      
      {/* Continue Button */}
      {enrollment.status === 'active' && (
        <button onClick={() => navigate(`/courses/${course._id}/learn`)}>
          Continue Learning
        </button>
      )}
      
      {/* Certificate */}
      {enrollment.status === 'completed' && enrollment.certificateIssued.issued && (
        <button onClick={() => window.open(enrollment.certificateIssued.certificateUrl)}>
          Download Certificate
        </button>
      )}
    </div>
  );
};
```

## Data Models

### Database Schema Summary

```
EducationalCourse (Enhanced)
├── Basic Info: title, description, category, level
├── Content: topics, prerequisites, learningOutcomes, syllabus
├── Media: thumbnail, previewVideo
├── Pricing: price.amount, price.isFree
├── Stats: enrollments, rating, reviews, completionRate
├── Badges: most_popular, new, recommended, top_rated
└── Settings: allowReviews, certificateEnabled

CourseEnrollment (New)
├── References: course, student
├── Status: active, completed, dropped, expired
├── Progress: completedLessons, currentLesson, percentage
├── Certificate: issued, url, id
└── Payment: amount, transactionId

CourseLesson (New)
├── References: course
├── Content: title, description, order, section
├── Media: videoUrl, textContent, resources
├── Type: video, text, quiz, assignment
├── Access: isFree (preview)
└── Quiz: questions, options, answers

CourseReview (Extends Review)
├── References: course, enrollment, reviewer
├── Ratings: overall, detailed (content, instructor, value)
├── Content: title, comment, pros, cons
├── Status: completionStatus, wouldRecommend
└── Interactions: helpful, reports, response

Wishlist (New)
├── Reference: user
└── Courses: [{ course, addedAt, notes }]
```

### Relationships

```
User ──< CourseEnrollment >── EducationalCourse
User ──< CourseReview >── EducationalCourse
User ──< Wishlist >── EducationalCourse
EducationalCourse ──< CourseLesson
CourseEnrollment ──< CourseReview
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*



### Property 1: Filter Correctness

*For any* set of courses and any filter criteria (level, category, duration range, price, or minimum rating), all courses returned by the Filter_Engine should satisfy the specified filter conditions.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Multi-Filter Composition

*For any* set of courses and any combination of multiple filters applied simultaneously, all returned courses should satisfy ALL selected filter criteria.

**Validates: Requirements 1.6**

### Property 3: Clear Filters Returns All

*For any* course database state, when all filters are cleared, the Filter_Engine should return all published courses.

**Validates: Requirements 1.7**

### Property 4: Course Information Completeness

*For any* course displayed in the system, the rendered output should contain all required information fields: duration, lesson count, topics, prerequisites, and learning outcomes.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 5: Course Update Consistency

*For any* course, when its information is updated by an instructor, subsequent reads should immediately reflect the updated data.

**Validates: Requirements 2.7**

### Property 6: Rating Display Completeness

*For any* course displayed, the system should show the average rating, total enrolled students, and completion rate percentage.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 7: Review Authorization

*For any* student with completion percentage >= 50% for a course, the system should allow them to submit a review.

**Validates: Requirements 3.5**

### Property 8: Rating Recalculation

*For any* course, when a new review is submitted, the course's average rating should be recalculated correctly as the mean of all approved review ratings.

**Validates: Requirements 3.6**

### Property 9: Review Sort Order

*For any* set of course reviews, when displayed, they should be ordered by helpfulness count in descending order.

**Validates: Requirements 3.7**

### Property 10: Preview Access Without Enrollment

*For any* course, the first lesson marked as free preview should be accessible to users without requiring enrollment.

**Validates: Requirements 4.1, 4.5**

### Property 11: Preview View Tracking

*For any* course, when a user plays a preview lesson, the preview view count should increment by exactly 1.

**Validates: Requirements 4.4**

### Property 12: Badge Assignment - Most Popular

*For any* category, the course with the highest enrollment count in that category should have the "Most Popular" badge.

**Validates: Requirements 5.1**

### Property 13: Badge Assignment - New

*For any* course where (current date - publishedAt) <= 30 days, the course should have the "New" badge.

**Validates: Requirements 5.2**

### Property 14: Badge Assignment - Recommended

*For any* course where averageRating >= 4.5 AND completionRate >= 70%, the course should have the "Recommended" badge.

**Validates: Requirements 5.3**

### Property 15: Badge Assignment - Top Rated

*For any* category, the course with the highest average rating in that category should have the "Top Rated" badge.

**Validates: Requirements 5.4**

### Property 16: Badge Accumulation

*For any* course that meets multiple badge criteria, all applicable badges should be displayed.

**Validates: Requirements 5.5**

### Property 17: Badge Removal

*For any* course, when badge criteria are no longer met, the corresponding badge should be automatically removed.

**Validates: Requirements 5.6**

### Property 18: Progress Calculation

*For any* enrollment, the completion percentage should equal (completedLessons.length / course.totalLessons) * 100, rounded to nearest integer.

**Validates: Requirements 6.1**

### Property 19: Course Completion Status

*For any* enrollment, when all course lessons are marked complete (completedLessons.length === course.totalLessons), the enrollment status should be set to 'completed'.

**Validates: Requirements 6.4**

### Property 20: Certificate Generation

*For any* enrollment with status 'completed' where course.settings.certificateEnabled is true, a completion certificate should be generated with a unique certificate ID.

**Validates: Requirements 6.5**

### Property 21: Enrollment Sort Order

*For any* user's enrolled courses, when displayed, they should be sorted by progress.lastAccessedAt in descending order.

**Validates: Requirements 6.6**

### Property 22: Search Scope

*For any* search query, the results should include courses where the query matches any of: title, description, or topics array elements.

**Validates: Requirements 7.1**

### Property 23: Sort Order Correctness

*For any* set of courses and any sort option (newest, popular, rating, price), the returned courses should be ordered according to the specified field in the correct direction (ascending or descending).

**Validates: Requirements 7.3, 7.4, 7.5, 7.6**

### Property 24: Wishlist Add Operation

*For any* course and user, when the user adds the course to their wishlist, the course should appear in the user's wishlist with the current timestamp as addedAt.

**Validates: Requirements 8.1**

### Property 25: Wishlist Remove Operation

*For any* course already in a user's wishlist, when the user removes it, the course should no longer appear in the user's wishlist.

**Validates: Requirements 8.2**

### Property 26: Wishlist Retrieval

*For any* user, when they view their wishlist, all courses they have added should be displayed.

**Validates: Requirements 8.3**

### Property 27: Shareable URL Uniqueness

*For any* course, when a shareable link is generated, it should contain a unique identifier that maps back to that specific course.

**Validates: Requirements 8.5**

### Property 28: Referral Tracking

*For any* shared link access, the system should record the referral source in the access logs.

**Validates: Requirements 8.6**

### Property 29: Referrer Credit

*For any* enrollment that occurs via a shared link, the referrer user should be credited in the enrollment record.

**Validates: Requirements 8.7**

### Property 30: View Preference Persistence

*For any* user, when they switch between grid and list views, their current filters and sort order should be preserved.

**Validates: Requirements 9.3**

### Property 31: View Preference Storage

*For any* user, when they select a view preference (grid or list), that preference should be saved and restored in future sessions.

**Validates: Requirements 9.4**

### Property 32: RTL Layout Mirroring

*For any* page rendered in RTL mode (Arabic language), the layout direction should be mirrored appropriately with text-align: right and flex-direction: row-reverse.

**Validates: Requirements 10.5**

### Property 33: Touch Target Accessibility

*For any* interactive element (button, link, input), the minimum touch target size should be at least 44x44 pixels.

**Validates: Requirements 10.7**

### Property 34: Review Notification Integration

*For any* new course review created, a notification should be sent to the course instructor using the existing notification system.

**Validates: Requirements 11.1**

### Property 35: Completion Notification Integration

*For any* course enrollment that transitions to 'completed' status, a notification should be sent to the student using the existing notification system.

**Validates: Requirements 11.2**

### Property 36: Error Logging

*For any* error that occurs in the Course_System, the error should be logged with timestamp, error message, and stack trace.

**Validates: Requirements 11.6**

### Property 37: Referential Integrity

*For any* course update operation, all related enrollments and progress records should maintain valid references to the course.

**Validates: Requirements 11.7**

### Property 38: API Caching Headers

*For any* API response from course endpoints, appropriate caching headers (Cache-Control, ETag) should be included.

**Validates: Requirements 12.7**

## Error Handling

### Error Categories

1. **Validation Errors**
   - Invalid filter parameters (e.g., minRating > 5)
   - Invalid course data (missing required fields)
   - Invalid enrollment data (student already enrolled)
   - Invalid review data (rating out of range, insufficient completion)

2. **Authorization Errors**
   - Unauthenticated access to protected endpoints
   - Unauthorized course modifications (non-instructor)
   - Unauthorized review submission (< 50% completion)
   - Unauthorized certificate access (course not completed)

3. **Not Found Errors**
   - Course not found
   - Enrollment not found
   - Lesson not found
   - Review not found

4. **Business Logic Errors**
   - Enrollment in archived course
   - Review submission before 50% completion
   - Certificate generation for incomplete course
   - Badge assignment with unmet criteria

5. **Integration Errors**
   - Notification service failure
   - File upload failure (Cloudinary)
   - Database connection errors
   - External API failures

### Error Response Format

All errors follow consistent JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Error Handling Strategies

1. **Input Validation**: Validate all inputs at controller level before processing
2. **Try-Catch Blocks**: Wrap all async operations in try-catch
3. **Graceful Degradation**: Return partial data if some operations fail
4. **Retry Logic**: Retry failed external API calls (max 3 attempts)
5. **Error Logging**: Log all errors with context for debugging
6. **User-Friendly Messages**: Return clear, actionable error messages

### Example Error Handlers

```javascript
// Validation Error
if (!mongoose.Types.ObjectId.isValid(courseId)) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'INVALID_COURSE_ID',
      message: 'The provided course ID is not valid'
    }
  });
}

// Authorization Error
if (enrollment.progress.percentageComplete < 50) {
  return res.status(403).json({
    success: false,
    error: {
      code: 'INSUFFICIENT_PROGRESS',
      message: 'You must complete at least 50% of the course to submit a review',
      details: {
        currentProgress: enrollment.progress.percentageComplete,
        requiredProgress: 50
      }
    }
  });
}

// Not Found Error
if (!course) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'COURSE_NOT_FOUND',
      message: 'The requested course does not exist'
    }
  });
}

// Integration Error
try {
  await notificationService.sendNotification(...);
} catch (error) {
  logger.error('Failed to send notification:', error);
  // Continue execution - notification failure shouldn't block main operation
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

### Property-Based Testing

We will use **fast-check** (for JavaScript/Node.js) as our property-based testing library.

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: courses-page-enhancements, Property {N}: {property_text}`

**Example Property Test:**

```javascript
const fc = require('fast-check');

describe('Feature: courses-page-enhancements, Property 1: Filter Correctness', () => {
  it('should return only courses matching filter criteria', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(courseArbitrary()), // Generate random courses
        fc.record({ // Generate random filter
          level: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced')),
          minRating: fc.option(fc.float({ min: 1, max: 5 }))
        }),
        async (courses, filter) => {
          // Setup: Insert courses into test database
          await Course.insertMany(courses);
          
          // Execute: Apply filter
          const results = await filterService.filterCourses(filter);
          
          // Verify: All results match filter
          results.forEach(course => {
            if (filter.level) {
              expect(course.level).toBe(filter.level);
            }
            if (filter.minRating) {
              expect(course.stats.averageRating).toBeGreaterThanOrEqual(filter.minRating);
            }
          });
          
          // Cleanup
          await Course.deleteMany({});
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Focus

Unit tests should focus on:

1. **Specific Examples**
   - Empty filter results message (1.8)
   - Preview completion prompt (4.6)
   - Share button UI (8.4)
   - View layout examples (9.1, 9.2)
   - Responsive breakpoints (10.1-10.4)
   - Pagination default (12.6)

2. **Edge Cases**
   - Course with no reviews (rating = 0)
   - Course with no enrollments
   - Enrollment with 0% progress
   - Enrollment with 100% progress
   - Badge criteria boundary conditions (exactly 30 days, exactly 4.5 rating)
   - Empty wishlist
   - Empty search results

3. **Error Conditions**
   - Invalid course ID
   - Unauthorized review submission
   - Duplicate enrollment attempt
   - Certificate generation for incomplete course
   - Filter with invalid parameters
   - Search with malicious input

4. **Integration Points**
   - Notification service calls
   - Review system integration
   - File upload integration
   - Database transactions

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: 100% of identified properties
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows (browse → enroll → complete → certificate)

### Testing Tools

- **Unit Testing**: Jest
- **Property Testing**: fast-check
- **API Testing**: Supertest
- **E2E Testing**: Cypress or Playwright
- **Coverage**: Istanbul/nyc

### Example Unit Test

```javascript
describe('courseController.enrollInCourse', () => {
  it('should create enrollment and update course stats', async () => {
    // Arrange
    const course = await Course.create({
      title: 'Test Course',
      status: 'Published',
      stats: { totalEnrollments: 0 }
    });
    const user = await User.create({ email: 'test@example.com' });
    
    // Act
    const response = await request(app)
      .post(`/courses/${course._id}/enroll`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(201);
    
    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.enrollment.student).toBe(user._id.toString());
    
    const updatedCourse = await Course.findById(course._id);
    expect(updatedCourse.stats.totalEnrollments).toBe(1);
  });
  
  it('should return error for duplicate enrollment', async () => {
    // Arrange
    const course = await Course.create({ title: 'Test Course', status: 'Published' });
    const user = await User.create({ email: 'test@example.com' });
    await CourseEnrollment.create({ course: course._id, student: user._id });
    
    // Act
    const response = await request(app)
      .post(`/courses/${course._id}/enroll`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(400);
    
    // Assert
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ALREADY_ENROLLED');
  });
});
```

### Continuous Integration

- Run all tests on every commit
- Block merge if tests fail
- Generate coverage reports
- Run property tests with higher iteration count (1000+) in CI

## Implementation Notes

### Performance Considerations

1. **Database Indexes**: Create compound indexes for common filter combinations
2. **Caching**: Cache course lists with Redis (TTL: 5 minutes)
3. **Pagination**: Always paginate results (default: 12 per page)
4. **Lazy Loading**: Load course images and videos on demand
5. **Aggregation**: Use MongoDB aggregation for complex queries (stats, badges)

### Security Considerations

1. **Authentication**: All write operations require valid JWT token
2. **Authorization**: Verify user permissions for course modifications
3. **Input Sanitization**: Sanitize all user inputs to prevent XSS/injection
4. **Rate Limiting**: Limit API calls per user (100 requests/minute)
5. **File Upload**: Validate file types and sizes for course materials

### Scalability Considerations

1. **Horizontal Scaling**: Stateless API design for load balancing
2. **Database Sharding**: Shard courses by category for large datasets
3. **CDN**: Serve static assets (images, videos) via CDN
4. **Async Processing**: Use job queues for certificate generation
5. **Microservices**: Consider separating course service if it grows large

### Monitoring and Observability

1. **Logging**: Log all API requests, errors, and important events
2. **Metrics**: Track enrollment rate, completion rate, review rate
3. **Alerts**: Alert on high error rates, slow queries, failed integrations
4. **Dashboards**: Create dashboards for course performance metrics
5. **Tracing**: Implement distributed tracing for debugging

### Migration Strategy

1. **Phase 1**: Add new fields to existing EducationalCourse model
2. **Phase 2**: Create new models (CourseEnrollment, CourseLesson, Wishlist)
3. **Phase 3**: Migrate existing enrollments to new model
4. **Phase 4**: Deploy new API endpoints
5. **Phase 5**: Update frontend to use new endpoints
6. **Phase 6**: Deprecate old endpoints after transition period

### Backward Compatibility

- Maintain existing API endpoints during migration
- Support both old and new data formats temporarily
- Provide migration scripts for existing data
- Document breaking changes clearly
- Give users advance notice of deprecations
