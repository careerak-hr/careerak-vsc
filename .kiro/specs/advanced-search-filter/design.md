# نظام الفلترة والبحث المتقدم - التصميم التقني

## 📋 معلومات الوثيقة

- **اسم الميزة**: نظام الفلترة والبحث المتقدم
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: قيد التصميم
- **المطور**: Eng.AlaaUddien

---

## 1. Overview

نظام الفلترة والبحث المتقدم هو نظام شامل يوفر للمستخدمين القدرة على البحث عن الوظائف والدورات التدريبية بطريقة ذكية وفعالة. يتضمن النظام:

- **محرك بحث نصي ذكي** يدعم البحث في حقول متعددة مع اقتراحات تلقائية
- **نظام فلترة متقدم** مع دعم فلاتر متعددة ومنطق AND/OR للمهارات
- **حفظ عمليات البحث** مع إمكانية إعادة استخدامها بنقرة واحدة
- **تنبيهات ذكية** تُرسل تلقائياً عند ظهور نتائج جديدة
- **عرض خريطة تفاعلي** لعرض الوظائف جغرافياً
- **نظام مطابقة المهارات** مع حساب نسبة التطابق

### الأهداف الرئيسية

1. **السرعة**: نتائج بحث خلال أقل من 500ms
2. **الدقة**: نتائج مطابقة بدقة عالية لمعايير البحث
3. **سهولة الاستخدام**: واجهة بديهية مع تجربة مستخدم سلسة
4. **الذكاء**: اقتراحات ذكية ومطابقة متقدمة للمهارات

---

## 2. Architecture

### 2.1 المعمارية العامة

النظام يتبع معمارية ثلاثية الطبقات (Three-Tier Architecture):

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Search Page  │  │  Map View    │  │ Saved Panel  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │SearchService │  │ FilterService│  │ AlertService │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MongoDB    │  │  Text Index  │  │  Geo Index   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 مكونات النظام

#### Backend Components

1. **SearchController**: معالج طلبات البحث والفلترة
2. **SearchService**: منطق البحث والمطابقة
3. **FilterService**: تطبيق الفلاتر المتعددة
4. **SavedSearchService**: إدارة عمليات البحث المحفوظة
5. **AlertService**: إدارة التنبيهات الذكية
6. **MatchingEngine**: حساب نسبة مطابقة المهارات

#### Frontend Components

1. **SearchBar**: شريط البحث مع autocomplete
2. **FilterPanel**: لوحة الفلاتر الجانبية
3. **ResultsList**: عرض النتائج
4. **MapView**: عرض الخريطة التفاعلية
5. **SavedSearchesPanel**: لوحة عمليات البحث المحفوظة
6. **AlertsManager**: إدارة التنبيهات

### 2.3 تدفق البيانات

```
User Input → SearchBar → SearchController → SearchService
                                                  │
                                                  ├→ FilterService
                                                  ├→ MatchingEngine
                                                  └→ Database Query
                                                          │
                                                          ▼
                                                    Results
                                                          │
                                                          ├→ ResultsList
                                                          └→ MapView
```

---

## 3. Components and Interfaces

### 3.1 Backend APIs

#### Search API

```javascript
// GET /api/search/jobs
// Query Parameters:
{
  q: string,              // كلمة البحث
  location: string,       // الموقع
  salaryMin: number,      // الحد الأدنى للراتب
  salaryMax: number,      // الحد الأقصى للراتب
  workType: string[],     // نوع العمل
  experienceLevel: string[], // مستوى الخبرة
  skills: string[],       // المهارات
  skillsLogic: 'AND' | 'OR', // منطق المهارات
  datePosted: string,     // تاريخ النشر
  companySize: string[],  // حجم الشركة
  page: number,           // رقم الصفحة
  limit: number,          // عدد النتائج
  sort: string            // الترتيب
}

// Response:
{
  success: true,
  data: {
    results: JobPosting[],
    total: number,
    page: number,
    pages: number,
    filters: {
      applied: FilterObject,
      available: AvailableFilters
    }
  }
}
```

#### Autocomplete API

```javascript
// GET /api/search/autocomplete
// Query Parameters:
{
  q: string,              // النص المدخل
  type: 'jobs' | 'courses', // نوع البحث
  limit: number           // عدد الاقتراحات
}

// Response:
{
  success: true,
  data: {
    suggestions: string[]
  }
}
```

#### Saved Searches API

```javascript
// POST /api/search/saved
// Body:
{
  name: string,           // اسم عملية البحث
  searchParams: SearchParams, // معاملات البحث
  alertEnabled: boolean,  // تفعيل التنبيهات
  alertFrequency: 'instant' | 'daily' | 'weekly'
}

// GET /api/search/saved
// Response:
{
  success: true,
  data: {
    savedSearches: SavedSearch[]
  }
}

// PUT /api/search/saved/:id
// DELETE /api/search/saved/:id
```

#### Alerts API

```javascript
// POST /api/search/alerts
// Body:
{
  savedSearchId: ObjectId,
  frequency: 'instant' | 'daily' | 'weekly',
  notificationMethod: 'push' | 'email' | 'both'
}

// GET /api/search/alerts
// PUT /api/search/alerts/:id
// DELETE /api/search/alerts/:id
```

#### Map Search API

```javascript
// GET /api/search/map
// Query Parameters:
{
  bounds: {
    north: number,
    south: number,
    east: number,
    west: number
  },
  ...otherFilters
}

// Response:
{
  success: true,
  data: {
    markers: [{
      id: string,
      position: { lat: number, lng: number },
      title: string,
      count: number  // للـ clustering
    }]
  }
}
```

### 3.2 Frontend Components

#### SearchBar Component

```typescript
interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}

interface SearchBarState {
  query: string;
  suggestions: string[];
  isLoading: boolean;
  showSuggestions: boolean;
}
```

#### FilterPanel Component

```typescript
interface FilterPanelProps {
  filters: FilterConfig;
  appliedFilters: AppliedFilters;
  onFilterChange: (filters: AppliedFilters) => void;
  onClearFilters: () => void;
  resultCount: number;
}

interface FilterConfig {
  salary: { min: number; max: number };
  locations: string[];
  workTypes: WorkType[];
  experienceLevels: ExperienceLevel[];
  skills: Skill[];
  companySize: CompanySize[];
}
```

#### MapView Component

```typescript
interface MapViewProps {
  jobs: JobPosting[];
  center: { lat: number; lng: number };
  zoom: number;
  onMarkerClick: (jobId: string) => void;
  onBoundsChange: (bounds: Bounds) => void;
}
```

### 3.3 Services

#### SearchService

```javascript
class SearchService {
  // البحث النصي الأساسي
  async textSearch(query, options) {
    // استخدام MongoDB text search
    // مع دعم العربية والإنجليزية
  }
  
  // تطبيق الفلاتر
  async applyFilters(results, filters) {
    // تطبيق فلاتر متعددة
  }
  
  // حساب نسبة المطابقة
  calculateMatchScore(job, userProfile) {
    // حساب نسبة مطابقة المهارات
  }
  
  // الترتيب
  sortResults(results, sortBy) {
    // ترتيب حسب: relevance, date, salary, match
  }
}
```

#### FilterService

```javascript
class FilterService {
  // فلترة حسب الراتب
  filterBySalary(jobs, min, max) {
    return jobs.filter(job => 
      job.salary >= min && job.salary <= max
    );
  }
  
  // فلترة حسب الموقع
  filterByLocation(jobs, location) {
    // دعم البحث بالمدينة أو الدولة
  }
  
  // فلترة حسب المهارات مع منطق AND/OR
  filterBySkills(jobs, skills, logic) {
    if (logic === 'AND') {
      // يجب توفر جميع المهارات
      return jobs.filter(job =>
        skills.every(skill => job.skills.includes(skill))
      );
    } else {
      // يكفي توفر أي مهارة
      return jobs.filter(job =>
        skills.some(skill => job.skills.includes(skill))
      );
    }
  }
  
  // فلترة حسب التاريخ
  filterByDate(jobs, dateRange) {
    // today, week, month, all
  }
}
```

#### MatchingEngine

```javascript
class MatchingEngine {
  // حساب نسبة المطابقة
  calculateMatchPercentage(jobSkills, userSkills) {
    const matchedSkills = jobSkills.filter(skill =>
      userSkills.includes(skill)
    );
    return (matchedSkills.length / jobSkills.length) * 100;
  }
  
  // ترتيب حسب المطابقة
  rankByMatch(jobs, userProfile) {
    return jobs.map(job => ({
      ...job,
      matchScore: this.calculateMatchPercentage(
        job.skills,
        userProfile.skills
      )
    })).sort((a, b) => b.matchScore - a.matchScore);
  }
}
```

#### AlertService

```javascript
class AlertService {
  // فحص النتائج الجديدة
  async checkNewResults(savedSearch) {
    const lastCheck = savedSearch.lastChecked;
    const newJobs = await this.searchNewJobs(
      savedSearch.searchParams,
      lastCheck
    );
    
    if (newJobs.length > 0) {
      await this.sendAlert(savedSearch.userId, newJobs);
    }
  }
  
  // إرسال التنبيه
  async sendAlert(userId, jobs) {
    // استخدام نظام الإشعارات الموجود
    await notificationService.create({
      userId,
      type: 'search_alert',
      title: 'وظائف جديدة تطابق بحثك',
      message: `تم العثور على ${jobs.length} وظيفة جديدة`,
      data: { jobs }
    });
  }
  
  // جدولة التنبيهات
  scheduleAlerts() {
    // استخدام cron jobs للتنبيهات اليومية/الأسبوعية
  }
}
```

---

## 4. Data Models

### 4.1 SavedSearch Model

```javascript
const SavedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  searchType: {
    type: String,
    enum: ['jobs', 'courses'],
    required: true
  },
  searchParams: {
    query: String,
    location: String,
    salaryMin: Number,
    salaryMax: Number,
    workType: [String],
    experienceLevel: [String],
    skills: [String],
    skillsLogic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'OR'
    },
    datePosted: String,
    companySize: [String]
  },
  alertEnabled: {
    type: Boolean,
    default: false
  },
  alertFrequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'instant'
  },
  notificationMethod: {
    type: String,
    enum: ['push', 'email', 'both'],
    default: 'push'
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  resultCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SavedSearchSchema.index({ userId: 1, createdAt: -1 });
SavedSearchSchema.index({ alertEnabled: 1, lastChecked: 1 });

// Limit: 10 saved searches per user
SavedSearchSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      userId: this.userId
    });
    if (count >= 10) {
      throw new Error('Maximum 10 saved searches allowed per user');
    }
  }
  next();
});
```

### 4.2 SearchAlert Model

```javascript
const SearchAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  savedSearchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedSearch',
    required: true
  },
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    required: true
  },
  notificationMethod: {
    type: String,
    enum: ['push', 'email', 'both'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  triggerCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SearchAlertSchema.index({ userId: 1, isActive: 1 });
SearchAlertSchema.index({ frequency: 1, lastTriggered: 1 });
```

### 4.3 SearchHistory Model

```javascript
const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  searchType: {
    type: String,
    enum: ['jobs', 'courses'],
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed
  },
  resultCount: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL Index: حذف السجلات بعد 90 يوم
SearchHistorySchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
);
```

### 4.4 Database Indexes

#### JobPosting Indexes

```javascript
// Text index للبحث النصي
JobPostingSchema.index({
  title: 'text',
  description: 'text',
  'company.name': 'text',
  skills: 'text'
}, {
  weights: {
    title: 10,
    skills: 5,
    'company.name': 3,
    description: 1
  },
  default_language: 'arabic'
});

// Geo index للبحث الجغرافي
JobPostingSchema.index({
  'location.coordinates': '2dsphere'
});

// Compound indexes للفلاتر
JobPostingSchema.index({
  status: 1,
  createdAt: -1
});

JobPostingSchema.index({
  'salary.min': 1,
  'salary.max': 1
});

JobPostingSchema.index({
  workType: 1,
  experienceLevel: 1
});

JobPostingSchema.index({
  skills: 1
});
```

---

## 5. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Multi-field Search Coverage

*For any* search query and any collection of job postings, when searching across all specified fields (title, description, skills, company name), the results should include all jobs where the query matches any of these fields.

**Validates: Requirements 1.1**

### Property 2: Autocomplete Threshold

*For any* search input text, if the text length is less than 3 characters, the system should return zero suggestions; if the text length is 3 or more characters, the system should return at least one suggestion (if matching data exists).

**Validates: Requirements 1.3**

### Property 3: Bilingual Search Support

*For any* search query in Arabic or English, the system should return relevant results in the same language, demonstrating that both languages are fully supported.

**Validates: Requirements 1.4**

### Property 4: Multiple Filter Application

*For any* combination of filters (salary, location, work type, experience, skills, date, company size), when applied simultaneously, the results should satisfy all filter conditions (AND logic between different filter types).

**Validates: Requirements 2.2**

### Property 5: Filter URL Persistence (Round-trip)

*For any* set of applied filters, when serialized to URL parameters and then deserialized back, the resulting filter object should be equivalent to the original filter object.

**Validates: Requirements 2.3**

### Property 6: Result Count Accuracy

*For any* applied filter and any dataset, the result count displayed should exactly equal the number of results returned by the search query.

**Validates: Requirements 2.4**

### Property 7: Clear Filters Reset

*For any* state with applied filters, when the "clear filters" action is triggered, the resulting state should be equivalent to the default state with no filters applied.

**Validates: Requirements 2.5**

### Property 8: Saved Search Limit Enforcement

*For any* user, when attempting to save more than 10 search operations, the system should reject the 11th save attempt and maintain exactly 10 or fewer saved searches.

**Validates: Requirements 3.1**

### Property 9: Saved Search Round-trip

*For any* search operation (including query and all filters), when saved and then retrieved, the retrieved search should contain all the original search parameters unchanged.

**Validates: Requirements 3.2**

### Property 10: Save Operation Notifications

*For any* save, update, or delete operation on a saved search, the system should generate exactly one notification for that operation.

**Validates: Requirements 3.4**

### Property 11: Alert Triggering on New Match

*For any* active alert with specific search criteria, when a new job posting is created that matches those criteria, the system should trigger exactly one alert notification.

**Validates: Requirements 4.1**

### Property 12: Alert Toggle Behavior

*For any* saved search with an alert, when the alert is enabled, matching jobs should trigger notifications; when disabled, no notifications should be sent for matching jobs.

**Validates: Requirements 4.2**

### Property 13: Alert Notification Link Validity

*For any* alert notification generated, the notification should contain a valid direct link to the job posting that triggered the alert.

**Validates: Requirements 4.3**

### Property 14: Alert Deduplication

*For any* job posting, when it matches multiple times with the same alert criteria (e.g., re-indexed or updated), the system should send at most one alert notification for that job.

**Validates: Requirements 4.4**

### Property 15: Map Marker Completeness

*For any* set of job postings with valid geographic coordinates, when displayed on the map, the number of markers (or marker clusters) should represent all jobs in the dataset.

**Validates: Requirements 5.1**

### Property 16: Geographic Boundary Filtering

*For any* geographic boundary (circle or rectangle) drawn on the map, all returned job results should have coordinates that fall within that boundary.

**Validates: Requirements 5.2**

### Property 17: Map Bilingual Support

*For any* map interface element (labels, tooltips, controls), when the language is switched between Arabic and English, all text should display correctly in the selected language.

**Validates: Requirements 5.4**

### Property 18: Skills Logic (AND/OR)

*For any* set of selected skills and any collection of jobs:
- When using AND logic, all returned jobs should contain all selected skills
- When using OR logic, all returned jobs should contain at least one of the selected skills

**Validates: Requirements 6.2**

### Property 19: Match Score Sorting

*For any* search results with calculated match scores, the results should be sorted in descending order by match score (highest match first).

**Validates: Requirements 6.3**

### Property 20: Match Percentage Calculation

*For any* job posting with required skills and any user profile with skills, the match percentage should equal (number of matching skills / total job required skills) × 100.

**Validates: Requirements 6.4**

---

## 6. Error Handling

### 6.1 Search Errors

```javascript
// Empty query handling
if (!query || query.trim().length === 0) {
  return {
    success: true,
    data: {
      results: [],
      total: 0,
      message: 'Please enter a search query'
    }
  };
}

// Invalid filter values
if (salaryMin < 0 || salaryMax < salaryMin) {
  throw new ValidationError('Invalid salary range');
}

// Database errors
try {
  const results = await JobPosting.find(searchQuery);
} catch (error) {
  logger.error('Search query failed:', error);
  throw new DatabaseError('Search operation failed');
}
```

### 6.2 Saved Search Errors

```javascript
// Limit exceeded
if (userSavedSearchCount >= 10) {
  throw new LimitExceededError(
    'Maximum 10 saved searches allowed per user'
  );
}

// Duplicate name
const existing = await SavedSearch.findOne({
  userId,
  name: searchName
});
if (existing) {
  throw new DuplicateError('Search name already exists');
}

// Not found
const savedSearch = await SavedSearch.findById(id);
if (!savedSearch) {
  throw new NotFoundError('Saved search not found');
}

// Unauthorized access
if (savedSearch.userId.toString() !== userId) {
  throw new UnauthorizedError('Access denied');
}
```

### 6.3 Alert Errors

```javascript
// Invalid frequency
if (!['instant', 'daily', 'weekly'].includes(frequency)) {
  throw new ValidationError('Invalid alert frequency');
}

// Alert already exists
const existing = await SearchAlert.findOne({
  userId,
  savedSearchId
});
if (existing) {
  throw new DuplicateError('Alert already exists for this search');
}

// Failed to send notification
try {
  await notificationService.send(notification);
} catch (error) {
  logger.error('Failed to send alert:', error);
  // Don't throw - log and continue
  // Retry mechanism should handle this
}
```

### 6.4 Map Errors

```javascript
// Invalid coordinates
if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
  throw new ValidationError('Invalid coordinates');
}

// Invalid bounds
if (bounds.north <= bounds.south || 
    bounds.east <= bounds.west) {
  throw new ValidationError('Invalid map bounds');
}

// Geocoding failure
try {
  const coords = await geocodeAddress(address);
} catch (error) {
  logger.warn('Geocoding failed:', error);
  // Return job without coordinates
  return { ...job, coordinates: null };
}
```

### 6.5 General Error Responses

```javascript
// Standard error response format
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly error message',
    details: {} // Optional technical details
  }
}

// Error codes
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  DUPLICATE: 'DUPLICATE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};
```

---

## 7. Testing Strategy

### 7.1 Dual Testing Approach

This system requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness

### 7.2 Property-Based Testing

**Library**: We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: advanced-search-filter, Property {number}: {property_text}`

**Example Property Test**:

```javascript
import fc from 'fast-check';

describe('Advanced Search Filter - Property Tests', () => {
  
  // Feature: advanced-search-filter, Property 1: Multi-field Search Coverage
  it('should search across all specified fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(jobPostingArbitrary()),
        async (query, jobs) => {
          // Insert test data
          await JobPosting.insertMany(jobs);
          
          // Perform search
          const results = await searchService.search(query);
          
          // Verify: results include all jobs matching in any field
          const expected = jobs.filter(job =>
            job.title.includes(query) ||
            job.description.includes(query) ||
            job.skills.some(s => s.includes(query)) ||
            job.company.name.includes(query)
          );
          
          expect(results.length).toBeGreaterThanOrEqual(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: advanced-search-filter, Property 5: Filter URL Persistence
  it('should preserve filters through URL round-trip', () => {
    fc.assert(
      fc.property(
        filterArbitrary(),
        (filters) => {
          // Serialize to URL
          const url = serializeFiltersToURL(filters);
          
          // Deserialize from URL
          const restored = deserializeFiltersFromURL(url);
          
          // Verify: restored equals original
          expect(restored).toEqual(filters);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: advanced-search-filter, Property 20: Match Percentage Calculation
  it('should calculate correct match percentage', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (jobSkills, userSkills) => {
          const matchScore = matchingEngine.calculateMatchPercentage(
            jobSkills,
            userSkills
          );
          
          const matchedCount = jobSkills.filter(s =>
            userSkills.includes(s)
          ).length;
          
          const expected = (matchedCount / jobSkills.length) * 100;
          
          expect(matchScore).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 7.3 Unit Testing

**Focus Areas**:
- Specific filter combinations
- Edge cases (empty results, single result, maximum results)
- Error conditions (invalid input, database errors)
- Integration between components

**Example Unit Tests**:

```javascript
describe('SearchService - Unit Tests', () => {
  
  it('should return empty results for empty query', async () => {
    const results = await searchService.search('');
    expect(results.data.results).toEqual([]);
    expect(results.data.total).toBe(0);
  });
  
  it('should filter by salary range correctly', async () => {
    const jobs = await createTestJobs([
      { salary: 5000 },
      { salary: 10000 },
      { salary: 15000 }
    ]);
    
    const results = await searchService.search('', {
      salaryMin: 8000,
      salaryMax: 12000
    });
    
    expect(results.data.results).toHaveLength(1);
    expect(results.data.results[0].salary).toBe(10000);
  });
  
  it('should throw error when saving 11th search', async () => {
    const userId = 'test-user';
    
    // Create 10 saved searches
    for (let i = 0; i < 10; i++) {
      await savedSearchService.create(userId, {
        name: `Search ${i}`,
        searchParams: {}
      });
    }
    
    // Attempt 11th
    await expect(
      savedSearchService.create(userId, {
        name: 'Search 11',
        searchParams: {}
      })
    ).rejects.toThrow('Maximum 10 saved searches allowed');
  });
  
  it('should apply AND logic for skills correctly', async () => {
    const jobs = await createTestJobs([
      { skills: ['JavaScript', 'React', 'Node.js'] },
      { skills: ['JavaScript', 'React'] },
      { skills: ['JavaScript'] }
    ]);
    
    const results = await searchService.search('', {
      skills: ['JavaScript', 'React'],
      skillsLogic: 'AND'
    });
    
    expect(results.data.results).toHaveLength(2);
    results.data.results.forEach(job => {
      expect(job.skills).toContain('JavaScript');
      expect(job.skills).toContain('React');
    });
  });
});
```

### 7.4 Integration Testing

```javascript
describe('Search System - Integration Tests', () => {
  
  it('should handle complete search workflow', async () => {
    // 1. Create user
    const user = await createTestUser();
    
    // 2. Perform search
    const searchResults = await request(app)
      .get('/api/search/jobs')
      .query({ q: 'developer', location: 'Cairo' })
      .set('Authorization', `Bearer ${user.token}`);
    
    expect(searchResults.status).toBe(200);
    expect(searchResults.body.data.results).toBeDefined();
    
    // 3. Save search
    const savedSearch = await request(app)
      .post('/api/search/saved')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'Cairo Developer Jobs',
        searchParams: { q: 'developer', location: 'Cairo' }
      });
    
    expect(savedSearch.status).toBe(201);
    
    // 4. Enable alert
    const alert = await request(app)
      .post('/api/search/alerts')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        savedSearchId: savedSearch.body.data._id,
        frequency: 'instant'
      });
    
    expect(alert.status).toBe(201);
    
    // 5. Create matching job
    const job = await createTestJob({
      title: 'Senior Developer',
      location: { city: 'Cairo' }
    });
    
    // 6. Verify alert was sent
    const notifications = await Notification.find({
      userId: user._id,
      type: 'search_alert'
    });
    
    expect(notifications).toHaveLength(1);
    expect(notifications[0].data.jobs[0]._id).toEqual(job._id);
  });
});
```

### 7.5 Performance Testing

```javascript
describe('Search Performance', () => {
  
  it('should return results within 500ms', async () => {
    // Create large dataset
    await createTestJobs(1000);
    
    const start = Date.now();
    await searchService.search('developer');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
  
  it('should handle concurrent searches efficiently', async () => {
    const searches = Array(50).fill(null).map((_, i) =>
      searchService.search(`query${i}`)
    );
    
    const start = Date.now();
    await Promise.all(searches);
    const duration = Date.now() - start;
    
    // Average should be under 500ms per search
    expect(duration / 50).toBeLessThan(500);
  });
});
```

---

## 8. Performance Optimization

### 8.1 Database Optimization

```javascript
// Use lean() for read-only queries
const results = await JobPosting
  .find(query)
  .lean()
  .limit(20);

// Use select() to limit fields
const results = await JobPosting
  .find(query)
  .select('title company.name location salary')
  .lean();

// Use explain() to analyze queries
const explanation = await JobPosting
  .find(query)
  .explain('executionStats');
```

### 8.2 Caching Strategy

```javascript
// Cache popular searches (Redis)
const cacheKey = `search:${JSON.stringify(searchParams)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await performSearch(searchParams);
await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min TTL

return results;
```

### 8.3 Pagination

```javascript
// Cursor-based pagination for better performance
const results = await JobPosting
  .find({
    ...query,
    _id: { $gt: lastSeenId }
  })
  .sort({ _id: 1 })
  .limit(20);
```

### 8.4 Debouncing

```javascript
// Frontend: Debounce autocomplete requests
const debouncedSearch = debounce(async (query) => {
  const suggestions = await api.getAutocomplete(query);
  setSuggestions(suggestions);
}, 300);
```

---

## 9. Security Considerations

### 9.1 Input Validation

```javascript
// Sanitize search queries
const sanitizedQuery = validator.escape(query);

// Validate filter values
const schema = Joi.object({
  q: Joi.string().max(200),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(0),
  skills: Joi.array().items(Joi.string()).max(20)
});
```

### 9.2 Rate Limiting

```javascript
// Limit search requests per user
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many search requests'
});

app.use('/api/search', limiter);
```

### 9.3 Authorization

```javascript
// Verify user owns saved search
const savedSearch = await SavedSearch.findById(id);
if (savedSearch.userId.toString() !== req.user._id.toString()) {
  throw new UnauthorizedError('Access denied');
}
```

---

## 10. Future Enhancements

1. **AI-Powered Recommendations**: Use machine learning to suggest relevant jobs
2. **Voice Search**: Support voice input for search queries
3. **Advanced Analytics**: Track search patterns and popular filters
4. **Collaborative Filtering**: "Users who searched for X also searched for Y"
5. **Saved Search Sharing**: Allow users to share saved searches with others
6. **Export Results**: Export search results to PDF/CSV
7. **Mobile App Integration**: Native mobile search experience
8. **Real-time Updates**: WebSocket for instant result updates

---

**تاريخ الإنشاء**: 2026-02-17  
**آخر تحديث**: 2026-02-17  
**الحالة**: جاهز للمراجعة

