# تحسينات صفحة الملف الشخصي - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: تحسينات صفحة الملف الشخصي (Enhanced Profile Page)
- **تاريخ الإنشاء**: 2026-02-18
- **الحالة**: قيد التصميم

## 1. Overview
تحسينات شاملة لصفحة الملف الشخصي تتضمن نسبة اكتمال، اقتراحات ذكية، معرض أعمال، روابط تواصل، مهارات متقدمة، ومعاينة احترافية.

## 2. Architecture

### System Architecture
```
Frontend (React)
    ↓
Profile Service → Completion Calculator
    ↓                ↓
Suggestions     Portfolio Manager
Engine              ↓
    ↓           File Storage (Cloudinary)
Analytics       
Service
    ↓
MongoDB
```

### Component Structure
```
ProfilePage
├── ProfileHeader (صورة، اسم، عنوان)
├── CompletionWidget (نسبة الاكتمال)
├── SuggestionsPanel (الاقتراحات)
├── AboutSection (عني)
├── SkillsSection (المهارات مع المستويات)
├── PortfolioGallery (معرض الأعمال)
├── SocialLinks (روابط التواصل)
├── ExperienceSection (الخبرات)
├── EducationSection (التعليم)
└── AnalyticsWidget (الإحصائيات)
```

## 3. Data Models

### ProfileCompletion Model
```javascript
{
  userId: ObjectId,
  completionPercentage: Number,  // 0-100
  sections: {
    profilePicture: { completed: Boolean, weight: 10 },
    about: { completed: Boolean, weight: 15 },
    skills: { completed: Boolean, weight: 20 },
    experience: { completed: Boolean, weight: 20 },
    education: { completed: Boolean, weight: 15 },
    portfolio: { completed: Boolean, weight: 10 },
    socialLinks: { completed: Boolean, weight: 5 },
    certifications: { completed: Boolean, weight: 5 }
  },
  lastCalculated: Date,
  updatedAt: Date
}
```

### ProfileSuggestion Model
```javascript
{
  userId: ObjectId,
  suggestions: [{
    id: String,
    type: 'add' | 'improve' | 'update',
    category: 'skills' | 'about' | 'portfolio' | 'experience',
    priority: 'high' | 'medium' | 'low',
    title: String,
    description: String,
    icon: String,  // 💡, ⚠️, ✨
    completed: Boolean,
    completedAt: Date
  }],
  generatedAt: Date,
  updatedAt: Date
}
```

### PortfolioItem Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  category: 'design' | 'development' | 'writing' | 'marketing' | 'other',
  type: 'image' | 'link' | 'pdf',
  fileUrl: String,        // Cloudinary URL
  thumbnailUrl: String,   // للصور
  externalLink: String,   // للروابط
  date: Date,
  tags: [String],
  order: Number,          // للترتيب
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### SocialLink Model
```javascript
{
  userId: ObjectId,
  platform: 'linkedin' | 'github' | 'behance' | 'dribbble' | 
            'twitter' | 'website' | 'youtube' | 'medium',
  url: String,
  isVisible: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### SkillLevel Model
```javascript
{
  userId: ObjectId,
  skills: [{
    name: String,
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    levelPercentage: Number,  // 25, 50, 75, 100
    category: 'technical' | 'soft' | 'language' | 'tool',
    yearsOfExperience: Number,
    certificationId: ObjectId,  // اختياري
    order: Number
  }],
  updatedAt: Date
}
```

### ProfileView Model
```javascript
{
  profileUserId: ObjectId,    // صاحب الملف
  viewerUserId: ObjectId,     // من شاهد الملف
  viewerType: 'company' | 'user' | 'anonymous',
  viewerCompanyName: String,  // إذا كان شركة
  timestamp: Date,
  duration: Number,           // مدة المشاهدة بالثواني
  sectionsViewed: [String],   // الأقسام التي شاهدها
  deviceType: 'mobile' | 'desktop' | 'tablet'
}
```

## 4. Profile Completion Algorithm

### Completion Calculation
```javascript
function calculateProfileCompletion(user) {
  const sections = {
    profilePicture: { weight: 10, check: () => !!user.profilePicture },
    about: { weight: 15, check: () => user.about?.length >= 100 },
    skills: { weight: 20, check: () => user.skills?.length >= 5 },
    experience: { weight: 20, check: () => user.experience?.length >= 1 },
    education: { weight: 15, check: () => user.education?.length >= 1 },
    portfolio: { weight: 10, check: () => user.portfolio?.length >= 1 },
    socialLinks: { weight: 5, check: () => user.socialLinks?.length >= 2 },
    certifications: { weight: 5, check: () => user.certifications?.length >= 1 }
  };
  
  let totalScore = 0;
  let completedSections = {};
  
  for (const [section, config] of Object.entries(sections)) {
    const isCompleted = config.check();
    completedSections[section] = {
      completed: isCompleted,
      weight: config.weight
    };
    if (isCompleted) {
      totalScore += config.weight;
    }
  }
  
  return {
    completionPercentage: totalScore,
    sections: completedSections
  };
}
```

## 5. Suggestions Engine

### Suggestion Generation
```javascript
function generateSuggestions(user, completion) {
  const suggestions = [];
  
  // اقتراحات بناءً على الأقسام الناقصة
  if (!completion.sections.profilePicture.completed) {
    suggestions.push({
      type: 'add',
      category: 'profile',
      priority: 'high',
      title: 'أضف صورة شخصية احترافية',
      description: 'الملفات مع صور تحصل على 40% مشاهدات أكثر',
      icon: '⚠️'
    });
  }
  
  if (!completion.sections.about.completed) {
    suggestions.push({
      type: 'improve',
      category: 'about',
      priority: 'high',
      title: 'اكتب نبذة شخصية مفصلة',
      description: 'اكتب على الأقل 100 كلمة عن خبراتك وأهدافك',
      icon: '💡'
    });
  }
  
  if (user.skills?.length < 5) {
    suggestions.push({
      type: 'add',
      category: 'skills',
      priority: 'high',
      title: 'أضف المزيد من المهارات',
      description: `لديك ${user.skills?.length || 0} مهارات. أضف 5 على الأقل`,
      icon: '✨'
    });
  }
  
  // اقتراحات متقدمة
  if (user.skills?.length >= 5 && !user.portfolio?.length) {
    suggestions.push({
      type: 'add',
      category: 'portfolio',
      priority: 'medium',
      title: 'أضف أعمالك السابقة',
      description: 'معرض الأعمال يزيد فرصك بنسبة 60%',
      icon: '✨'
    });
  }
  
  if (!user.socialLinks?.some(link => link.platform === 'linkedin')) {
    suggestions.push({
      type: 'add',
      category: 'social',
      priority: 'medium',
      title: 'أضف رابط LinkedIn',
      description: 'LinkedIn مهم للتواصل المهني',
      icon: '💡'
    });
  }
  
  // ترتيب حسب الأولوية
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  return suggestions.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  ).slice(0, 5);  // أفضل 5 اقتراحات
}
```

## 6. Portfolio Management

### File Upload Flow
```javascript
async function uploadPortfolioItem(file, metadata) {
  // 1. التحقق من نوع الملف
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('نوع ملف غير مدعوم');
  }
  
  // 2. التحقق من الحجم
  const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('حجم الملف كبير جداً');
  }
  
  // 3. رفع إلى Cloudinary
  const uploadResult = await cloudinary.uploader.upload(file, {
    folder: 'portfolio',
    resource_type: 'auto',
    transformation: file.type.startsWith('image/') ? [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ] : undefined
  });
  
  // 4. إنشاء thumbnail للصور
  let thumbnailUrl = null;
  if (file.type.startsWith('image/')) {
    thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      width: 400,
      height: 300,
      crop: 'fill'
    });
  }
  
  // 5. حفظ في قاعدة البيانات
  const portfolioItem = await PortfolioItem.create({
    userId: metadata.userId,
    title: metadata.title,
    description: metadata.description,
    category: metadata.category,
    type: file.type.startsWith('image/') ? 'image' : 'pdf',
    fileUrl: uploadResult.secure_url,
    thumbnailUrl,
    date: metadata.date,
    tags: metadata.tags
  });
  
  return portfolioItem;
}
```

## 7. Profile Preview Mode

### Preview Transformation
```javascript
function transformProfileForPreview(user) {
  return {
    // معلومات عامة
    name: user.name,
    title: user.title,
    profilePicture: user.profilePicture,
    about: user.about,
    
    // إخفاء معلومات حساسة
    email: user.email ? maskEmail(user.email) : null,
    phone: user.phone ? maskPhone(user.phone) : null,
    
    // معلومات مهنية
    skills: user.skills,
    experience: user.experience,
    education: user.education,
    certifications: user.certifications,
    portfolio: user.portfolio,
    
    // روابط مرئية فقط
    socialLinks: user.socialLinks?.filter(link => link.isVisible),
    
    // تقييم الملف
    profileRating: calculateProfileRating(user),
    strengths: identifyStrengths(user),
    improvements: identifyImprovements(user)
  };
}

function maskEmail(email) {
  const [username, domain] = email.split('@');
  return `${username.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  return `***${phone.slice(-4)}`;
}

function calculateProfileRating(user) {
  const completion = calculateProfileCompletion(user);
  if (completion.completionPercentage >= 90) return 'ممتاز';
  if (completion.completionPercentage >= 70) return 'جيد جداً';
  if (completion.completionPercentage >= 50) return 'جيد';
  return 'يحتاج تحسين';
}
```

## 8. Skills with Levels

### Skill Level Component
```jsx
function SkillWithLevel({ skill }) {
  const levelConfig = {
    beginner: { percentage: 25, color: '#D48161', label: 'مبتدئ' },
    intermediate: { percentage: 50, color: '#E3DAD1', label: 'متوسط' },
    advanced: { percentage: 75, color: '#304B60', label: 'متقدم' },
    expert: { percentage: 100, color: '#1a2f3f', label: 'خبير' }
  };
  
  const config = levelConfig[skill.level];
  
  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-level">{config.label}</span>
      </div>
      <div className="skill-progress-bar">
        <div 
          className="skill-progress-fill"
          style={{ 
            width: `${config.percentage}%`,
            backgroundColor: config.color
          }}
        />
      </div>
      {skill.yearsOfExperience && (
        <span className="skill-experience">
          {skill.yearsOfExperience} سنوات خبرة
        </span>
      )}
    </div>
  );
}
```

## 9. Analytics Tracking

### View Tracking
```javascript
async function trackProfileView(profileUserId, viewerData) {
  // تسجيل المشاهدة
  const view = await ProfileView.create({
    profileUserId,
    viewerUserId: viewerData.userId,
    viewerType: viewerData.type,
    viewerCompanyName: viewerData.companyName,
    timestamp: new Date(),
    deviceType: viewerData.deviceType
  });
  
  // تحديث عداد المشاهدات
  await User.findByIdAndUpdate(profileUserId, {
    $inc: { 'profileStats.views': 1 }
  });
  
  // إرسال إشعار (إذا كان المشاهد شركة)
  if (viewerData.type === 'company') {
    await notificationService.send({
      userId: profileUserId,
      type: 'profile_viewed',
      title: 'شاهدت شركة ملفك الشخصي',
      message: `${viewerData.companyName} شاهدت ملفك الشخصي`,
      priority: 'medium'
    });
  }
  
  return view;
}

async function getProfileAnalytics(userId, period = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  
  const views = await ProfileView.find({
    profileUserId: userId,
    timestamp: { $gte: startDate }
  });
  
  return {
    totalViews: views.length,
    uniqueViewers: new Set(views.map(v => v.viewerUserId.toString())).size,
    companyViews: views.filter(v => v.viewerType === 'company').length,
    viewsByDay: groupViewsByDay(views),
    topCompanies: getTopCompanies(views),
    averageDuration: calculateAverageDuration(views)
  };
}
```

## 10. Correctness Properties

### Property 1: Completion Percentage Accuracy
*For any* user profile, the completion percentage should equal the sum of weights of completed sections.
**Validates: Requirements 1.1**

### Property 2: Completion Range
*For any* profile completion calculation, the percentage should be between 0 and 100 inclusive.
**Validates: Requirements 1.1**

### Property 3: Suggestion Relevance
*For any* user with incomplete sections, suggestions should only recommend completing those specific sections.
**Validates: Requirements 2.1**

### Property 4: Suggestion Priority
*For any* set of suggestions, high priority suggestions should appear before medium and low priority ones.
**Validates: Requirements 2.1**

### Property 5: Portfolio Item Limit
*For any* user, the number of portfolio items should not exceed 10.
**Validates: Requirements 4.1**

### Property 6: File Size Validation
*For any* uploaded file, images should be ≤ 5MB and PDFs should be ≤ 10MB.
**Validates: Requirements 4.1**

### Property 7: Social Link Uniqueness
*For any* user, there should be at most one link per platform.
**Validates: Requirements 5.1**

### Property 8: URL Validation
*For any* social link, the URL should be a valid HTTP/HTTPS URL.
**Validates: Requirements 5.1**

### Property 9: Skill Level Consistency
*For any* skill, the level percentage should match the level name (beginner=25%, intermediate=50%, advanced=75%, expert=100%).
**Validates: Requirements 7.1**

### Property 10: Preview Privacy
*For any* profile preview, sensitive information (full email, full phone) should be masked.
**Validates: Requirements 3.1**

### Property 11: Analytics Accuracy
*For any* profile view tracking, each view should increment the total view count by exactly 1.
**Validates: Requirements 8.1**

### Property 12: Suggestion Completion
*For any* completed suggestion, it should not appear in future suggestion lists.
**Validates: Requirements 2.1**

## 11. UI/UX Design Patterns

### Completion Widget Design
```jsx
<div className="completion-widget">
  <div className="completion-header">
    <h3>اكتمال الملف الشخصي</h3>
    <span className={`completion-badge ${getCompletionClass(percentage)}`}>
      {percentage}%
    </span>
  </div>
  
  <div className="progress-bar-container">
    <div 
      className="progress-bar-fill"
      style={{ 
        width: `${percentage}%`,
        backgroundColor: getCompletionColor(percentage)
      }}
    />
  </div>
  
  <div className="completion-sections">
    {sections.map(section => (
      <div key={section.name} className="section-item">
        <span className={section.completed ? 'completed' : 'incomplete'}>
          {section.completed ? '✓' : '○'}
        </span>
        <span>{section.label}</span>
        <span className="section-weight">{section.weight}%</span>
      </div>
    ))}
  </div>
  
  {percentage === 100 && (
    <div className="completion-celebration">
      🎉 رائع! ملفك الشخصي مكتمل 100%
    </div>
  )}
</div>
```

### Portfolio Gallery Design
```jsx
<div className="portfolio-gallery">
  <div className="gallery-header">
    <h3>معرض الأعمال</h3>
    <button onClick={openUploadModal}>+ إضافة عمل</button>
  </div>
  
  <div className="gallery-grid">
    {portfolioItems.map(item => (
      <div key={item.id} className="portfolio-item">
        {item.type === 'image' ? (
          <img src={item.thumbnailUrl} alt={item.title} />
        ) : (
          <div className="pdf-preview">
            <FileIcon />
            <span>PDF</span>
          </div>
        )}
        <div className="item-overlay">
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <div className="item-actions">
            <button onClick={() => viewItem(item)}>عرض</button>
            <button onClick={() => editItem(item)}>تعديل</button>
            <button onClick={() => deleteItem(item)}>حذف</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

## 12. Testing Strategy
- Property-based tests for completion calculation
- Unit tests for suggestion engine
- Integration tests for file upload
- E2E tests for profile preview
- Performance tests for analytics queries

**تاريخ الإنشاء**: 2026-02-18
