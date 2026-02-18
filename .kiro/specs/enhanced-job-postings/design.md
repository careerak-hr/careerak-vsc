# تحسينات صفحة الوظائف - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: تحسينات صفحة الوظائف (Enhanced Job Postings Page)
- **تاريخ الإنشاء**: 2026-02-18
- **الحالة**: قيد التصميم

## 1. Overview
تحسينات شاملة لصفحة الوظائف تتضمن عرض مرن، حفظ الوظائف، مشاركة، وظائف مشابهة، تقدير الراتب، معلومات الشركة، وتحميل سلس.

## 2. Architecture

### System Architecture
```
Frontend (React)
    ↓
Job Service → Bookmark Manager
    ↓              ↓
Similar Jobs   Share Tracker
Engine             ↓
    ↓          Analytics
Salary         Service
Estimator
    ↓
MongoDB + Redis Cache
```

### Component Structure
```
JobPostingsPage
├── SearchBar (بحث وفلاتر)
├── ViewToggle (Grid/List)
├── JobsContainer
│   ├── JobCardGrid (عرض Grid)
│   └── JobCardList (عرض List)
├── JobDetailModal
│   ├── JobHeader
│   ├── JobDescription
│   ├── SalaryIndicator
│   ├── CompanyCard
│   ├── ShareButton
│   ├── BookmarkButton
│   └── SimilarJobsSection
└── SkeletonLoader
```

## 3. Data Models

### JobBookmark Model
```javascript
{
  userId: ObjectId,
  jobId: ObjectId,
  bookmarkedAt: Date,
  notifyOnChange: Boolean,  // إشعار عند تغيير حالة الوظيفة
  notes: String,            // ملاحظات شخصية (اختياري)
  tags: [String],           // تصنيفات (اختياري)
  updatedAt: Date
}
```

### JobShare Model
```javascript
{
  jobId: ObjectId,
  userId: ObjectId,         // من شارك
  platform: 'whatsapp' | 'linkedin' | 'twitter' | 'facebook' | 'copy',
  timestamp: Date,
  ipAddress: String,        // لمنع spam
  userAgent: String
}
```

### SalaryData Model
```javascript
{
  jobTitle: String,
  field: String,
  location: String,
  experienceLevel: String,
  salaries: [{
    amount: Number,
    currency: String,
    jobId: ObjectId,
    reportedAt: Date
  }],
  statistics: {
    average: Number,
    median: Number,
    min: Number,
    max: Number,
    count: Number
  },
  lastUpdated: Date
}
```

### CompanyInfo Model
```javascript
{
  companyId: ObjectId,
  logo: String,
  name: String,
  size: 'small' | 'medium' | 'large',  // < 50, 50-500, > 500
  employeeCount: Number,
  rating: {
    average: Number,      // 0-5
    count: Number,
    breakdown: {
      culture: Number,
      salary: Number,
      management: Number,
      workLife: Number
    }
  },
  openPositions: Number,
  website: String,
  description: String,
  responseRate: {
    percentage: Number,   // 0-100
    label: 'fast' | 'medium' | 'slow'
  },
  updatedAt: Date
}
```

### Job Model (تحديثات)
```javascript
{
  // الحقول الموجودة...
  
  // حقول جديدة
  bookmarkCount: Number,
  shareCount: Number,
  viewCount: Number,
  applicantCount: Number,
  isUrgent: Boolean,
  salaryEstimate: {
    provided: Number,
    market: {
      average: Number,
      min: Number,
      max: Number
    },
    comparison: 'below' | 'average' | 'above',
    percentageDiff: Number
  },
  similarJobIds: [ObjectId],  // cache
  lastSimilarityUpdate: Date
}
```

## 4. View Toggle System

### Local Storage Management
```javascript
const VIEW_PREFERENCE_KEY = 'jobViewPreference';

function saveViewPreference(view) {
  localStorage.setItem(VIEW_PREFERENCE_KEY, view);
}

function getViewPreference() {
  return localStorage.getItem(VIEW_PREFERENCE_KEY) || 'grid';
}

// React Hook
function useViewPreference() {
  const [view, setView] = useState(() => getViewPreference());
  
  const toggleView = () => {
    const newView = view === 'grid' ? 'list' : 'grid';
    setView(newView);
    saveViewPreference(newView);
  };
  
  return [view, toggleView];
}
```

### Grid vs List Layout
```jsx
// Grid View (3 columns)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {jobs.map(job => (
    <JobCardGrid key={job.id} job={job} />
  ))}
</div>

// List View (1 column, more details)
<div className="flex flex-col gap-4">
  {jobs.map(job => (
    <JobCardList key={job.id} job={job} />
  ))}
</div>
```

## 5. Bookmark System

### Bookmark Operations
```javascript
class BookmarkService {
  async toggleBookmark(userId, jobId) {
    const existing = await JobBookmark.findOne({ userId, jobId });
    
    if (existing) {
      // إزالة من المفضلة
      await JobBookmark.deleteOne({ _id: existing._id });
      await Job.findByIdAndUpdate(jobId, { $inc: { bookmarkCount: -1 } });
      return { bookmarked: false };
    } else {
      // إضافة للمفضلة
      await JobBookmark.create({ userId, jobId, bookmarkedAt: new Date() });
      await Job.findByIdAndUpdate(jobId, { $inc: { bookmarkCount: 1 } });
      return { bookmarked: true };
    }
  }
  
  async getBookmarkedJobs(userId, filters = {}) {
    const bookmarks = await JobBookmark.find({ userId })
      .sort({ bookmarkedAt: -1 })
      .populate({
        path: 'jobId',
        match: { status: 'active' }  // فقط الوظائف النشطة
      });
    
    return bookmarks
      .filter(b => b.jobId)  // إزالة الوظائف المحذوفة
      .map(b => b.jobId);
  }
  
  async notifyBookmarkChanges(jobId) {
    // إشعار المستخدمين عند تغيير حالة الوظيفة
    const bookmarks = await JobBookmark.find({ 
      jobId, 
      notifyOnChange: true 
    });
    
    for (const bookmark of bookmarks) {
      await notificationService.send({
        userId: bookmark.userId,
        type: 'job_status_changed',
        jobId,
        priority: 'medium'
      });
    }
  }
}
```

## 6. Share System

### Share Implementation
```javascript
// Frontend - Web Share API with fallback
async function shareJob(job, platform) {
  const shareData = {
    title: job.title,
    text: `${job.title} في ${job.company.name}`,
    url: `${window.location.origin}/jobs/${job.id}`
  };
  
  // Try native share first (mobile)
  if (platform === 'native' && navigator.share) {
    try {
      await navigator.share(shareData);
      trackShare(job.id, 'native');
      return;
    } catch (err) {
      console.log('Share cancelled');
    }
  }
  
  // Platform-specific sharing
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
  };
  
  if (platform === 'copy') {
    await navigator.clipboard.writeText(shareData.url);
    showToast('تم نسخ الرابط');
    trackShare(job.id, 'copy');
  } else {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    trackShare(job.id, platform);
  }
}

// Backend - Track shares
async function trackShare(jobId, platform, userId) {
  await JobShare.create({
    jobId,
    userId,
    platform,
    timestamp: new Date()
  });
  
  await Job.findByIdAndUpdate(jobId, {
    $inc: { shareCount: 1 }
  });
}
```

### Open Graph Tags
```html
<!-- في صفحة تفاصيل الوظيفة -->
<meta property="og:title" content="{job.title}" />
<meta property="og:description" content="{job.description.substring(0, 200)}" />
<meta property="og:image" content="{job.company.logo}" />
<meta property="og:url" content="{jobUrl}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

## 7. Similar Jobs Algorithm

### Similarity Calculation
```javascript
function calculateJobSimilarity(job1, job2) {
  let score = 0;
  
  // 1. نفس المجال (40%)
  if (job1.field === job2.field) {
    score += 40;
  }
  
  // 2. تشابه المهارات (30%)
  const commonSkills = job1.requiredSkills.filter(skill =>
    job2.requiredSkills.includes(skill)
  );
  const skillSimilarity = commonSkills.length / 
    Math.max(job1.requiredSkills.length, job2.requiredSkills.length);
  score += skillSimilarity * 30;
  
  // 3. نفس الموقع (15%)
  if (job1.location.city === job2.location.city) {
    score += 15;
  } else if (job1.location.country === job2.location.country) {
    score += 7;
  }
  
  // 4. نطاق راتب مشابه (15%)
  const salaryDiff = Math.abs(job1.salary - job2.salary);
  const salaryAvg = (job1.salary + job2.salary) / 2;
  const salaryScore = Math.max(0, 1 - (salaryDiff / salaryAvg));
  score += salaryScore * 15;
  
  return Math.round(score);
}

async function findSimilarJobs(jobId, limit = 6) {
  const job = await Job.findById(jobId);
  
  // Check cache first
  const cacheKey = `similar_jobs:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Find candidates
  const candidates = await Job.find({
    _id: { $ne: jobId },
    status: 'active',
    $or: [
      { field: job.field },
      { 'location.city': job.location.city },
      { requiredSkills: { $in: job.requiredSkills } }
    ]
  }).limit(50);
  
  // Calculate similarity scores
  const scored = candidates.map(candidate => ({
    job: candidate,
    score: calculateJobSimilarity(job, candidate)
  }));
  
  // Sort and get top results
  const similar = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.job);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(similar));
  
  return similar;
}
```

## 8. Salary Estimation

### Salary Calculator
```javascript
class SalaryEstimator {
  async estimateSalary(job) {
    // جمع بيانات الرواتب للوظائف المشابهة
    const salaryData = await SalaryData.findOne({
      jobTitle: { $regex: job.title, $options: 'i' },
      field: job.field,
      location: job.location.city,
      experienceLevel: job.experienceLevel
    });
    
    if (!salaryData || salaryData.statistics.count < 5) {
      // بيانات غير كافية
      return null;
    }
    
    const provided = job.salary;
    const market = salaryData.statistics;
    
    // حساب المقارنة
    let comparison, percentageDiff;
    
    if (provided < market.average * 0.9) {
      comparison = 'below';
      percentageDiff = Math.round(((market.average - provided) / market.average) * 100);
    } else if (provided > market.average * 1.1) {
      comparison = 'above';
      percentageDiff = Math.round(((provided - market.average) / market.average) * 100);
    } else {
      comparison = 'average';
      percentageDiff = 0;
    }
    
    return {
      provided,
      market: {
        average: market.average,
        min: market.min,
        max: market.max
      },
      comparison,
      percentageDiff
    };
  }
  
  async updateSalaryData() {
    // تحديث شهري لبيانات الرواتب
    const jobs = await Job.find({ 
      status: 'active',
      salary: { $exists: true, $gt: 0 }
    });
    
    // تجميع حسب: العنوان، المجال، الموقع، الخبرة
    const groups = {};
    
    for (const job of jobs) {
      const key = `${job.title}|${job.field}|${job.location.city}|${job.experienceLevel}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(job.salary);
    }
    
    // حساب الإحصائيات لكل مجموعة
    for (const [key, salaries] of Object.entries(groups)) {
      const [jobTitle, field, location, experienceLevel] = key.split('|');
      
      const sorted = salaries.sort((a, b) => a - b);
      const statistics = {
        average: salaries.reduce((a, b) => a + b) / salaries.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        count: salaries.length
      };
      
      await SalaryData.findOneAndUpdate(
        { jobTitle, field, location, experienceLevel },
        { statistics, lastUpdated: new Date() },
        { upsert: true }
      );
    }
  }
}
```

### Salary Indicator Component
```jsx
function SalaryIndicator({ estimate }) {
  if (!estimate) return null;
  
  const config = {
    below: { 
      color: '#ef4444', 
      icon: '🔴', 
      label: 'أقل من المتوسط',
      bgColor: 'bg-red-50'
    },
    average: { 
      color: '#f59e0b', 
      icon: '🟡', 
      label: 'متوسط السوق',
      bgColor: 'bg-yellow-50'
    },
    above: { 
      color: '#10b981', 
      icon: '🟢', 
      label: 'أعلى من المتوسط',
      bgColor: 'bg-green-50'
    }
  };
  
  const { color, icon, label, bgColor } = config[estimate.comparison];
  
  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">تقدير الراتب</span>
        <span>{icon}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>الراتب المعروض:</span>
          <span className="font-bold">{estimate.provided} ريال</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>متوسط السوق:</span>
          <span>{estimate.market.average} ريال</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>النطاق:</span>
          <span>{estimate.market.min} - {estimate.market.max} ريال</span>
        </div>
        
        <div className="pt-2 border-t">
          <span style={{ color }} className="font-semibold">
            {label}
            {estimate.percentageDiff > 0 && ` (${estimate.percentageDiff}%)`}
          </span>
        </div>
      </div>
    </div>
  );
}
```

## 9. Company Info Display

### Company Card Component
```jsx
function CompanyCard({ company, jobId }) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-start gap-4">
        <img 
          src={company.logo} 
          alt={company.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{company.name}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{getSizeLabel(company.size)}</span>
            {company.employeeCount && (
              <span>{company.employeeCount} موظف</span>
            )}
          </div>
          
          {company.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star}
                    filled={star <= company.rating.average}
                  />
                ))}
              </div>
              <span className="text-sm">
                {company.rating.average.toFixed(1)} ({company.rating.count} تقييم)
              </span>
            </div>
          )}
          
          <p className="text-sm text-gray-700 mb-4">
            {company.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-primary">
              {company.openPositions} وظيفة مفتوحة
            </span>
            
            {company.responseRate && (
              <span className={`px-2 py-1 rounded ${getResponseRateClass(company.responseRate.label)}`}>
                استجابة {getResponseRateLabel(company.responseRate.label)}
              </span>
            )}
          </div>
          
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => viewCompanyJobs(company.id)}
              className="btn-secondary"
            >
              وظائف أخرى
            </button>
            
            {company.website && (
              <a 
                href={company.website}
                target="_blank"
                className="btn-outline"
              >
                الموقع الإلكتروني
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 10. Skeleton Loading

### Skeleton Components
```jsx
// Grid Skeleton
function JobCardGridSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-8" />
      </div>
    </div>
  );
}

// List Skeleton
function JobCardListSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
        
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
          
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
            <div className="h-6 bg-gray-200 rounded-full w-28" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}

// Usage
function JobsList({ loading, jobs, view }) {
  if (loading) {
    return (
      <div className={view === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
        {[1,2,3,4,5,6].map(i => (
          view === 'grid' ? 
            <JobCardGridSkeleton key={i} /> : 
            <JobCardListSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return (
    // ... render actual jobs
  );
}
```

## 11. Correctness Properties

### Property 1: Bookmark Uniqueness
*For any* user and job, there should be at most one bookmark record.
**Validates: Requirements 2.1**

### Property 2: Bookmark Count Consistency
*For any* job, the bookmarkCount should equal the number of JobBookmark records for that job.
**Validates: Requirements 2.5**

### Property 3: Share Count Accuracy
*For any* job, the shareCount should equal the number of JobShare records for that job.
**Validates: Requirements 3.6**

### Property 4: Similar Jobs Relevance
*For any* job, similar jobs should have a similarity score ≥ 40%.
**Validates: Requirements 4.1**

### Property 5: Similar Jobs Limit
*For any* similar jobs query, the result should contain at most 6 jobs.
**Validates: Requirements 4.2**

### Property 6: Salary Comparison Accuracy
*For any* salary estimate, if provided < average * 0.9 then comparison = 'below', if provided > average * 1.1 then comparison = 'above', else comparison = 'average'.
**Validates: Requirements 5.1**

### Property 7: Salary Percentage Calculation
*For any* salary estimate with comparison ≠ 'average', percentageDiff should equal |provided - average| / average * 100.
**Validates: Requirements 5.1**

### Property 8: View Preference Persistence
*For any* view toggle, the preference should be saved to localStorage and persist across page reloads.
**Validates: Requirements 1.3**

### Property 9: Company Rating Range
*For any* company rating, the average should be between 0 and 5 inclusive.
**Validates: Requirements 6.4**

### Property 10: Skeleton Count Consistency
*For any* loading state, the number of skeleton items should match the expected number of jobs per page.
**Validates: Requirements 7.4**

## 12. Performance Optimizations

### Caching Strategy
```javascript
// Redis caching for expensive operations
const CACHE_DURATIONS = {
  similarJobs: 3600,      // 1 hour
  salaryEstimate: 86400,  // 24 hours
  companyInfo: 3600       // 1 hour
};

async function getCachedOrFetch(key, fetchFn, duration) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await redis.setex(key, duration, JSON.stringify(data));
  return data;
}
```

### Lazy Loading
```jsx
// Lazy load similar jobs section
const SimilarJobsSection = lazy(() => import('./SimilarJobsSection'));

function JobDetail({ job }) {
  return (
    <div>
      {/* Main content */}
      
      <Suspense fallback={<SkeletonLoader />}>
        <SimilarJobsSection jobId={job.id} />
      </Suspense>
    </div>
  );
}
```

## 13. Testing Strategy
- Property-based tests for similarity algorithm
- Unit tests for salary estimation
- Integration tests for bookmark system
- E2E tests for share functionality
- Performance tests for skeleton loading

**تاريخ الإنشاء**: 2026-02-18
