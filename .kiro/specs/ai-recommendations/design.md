# نظام التوصيات الذكية (AI) - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام التوصيات الذكية (AI)
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: قيد التصميم

## 1. Overview
نظام توصيات ذكي مدعوم بالذكاء الاصطناعي يستخدم Machine Learning لتقديم توصيات مخصصة للوظائف، الدورات، والمرشحين.

## 2. Architecture

### ML Pipeline
```
Data Collection → Feature Engineering → Model Training → Evaluation → Deployment
       ↓                  ↓                   ↓              ↓            ↓
   User Data        Feature Vector      ML Models      Metrics    Production API
   Job Data         TF-IDF, Embeddings  Collaborative  Accuracy   Real-time Inference
   Interactions     User Profile        Content-based  Precision
                                        Hybrid         Recall
```

### System Architecture
```
Frontend → API Gateway → Recommendation Service → ML Models
                              ↓                      ↓
                         Cache (Redis)         Model Storage
                              ↓                      ↓
                         Database              Training Pipeline
```

## 3. Recommendation Algorithms

### 3.1 Content-Based Filtering
يعتمد على تشابه المحتوى بين الوظائف/الدورات والملف الشخصي.

```python
def content_based_recommendation(user_profile, jobs):
    # استخراج features من الملف الشخصي
    user_vector = extract_features(user_profile)
    
    # حساب التشابه مع كل وظيفة
    similarities = []
    for job in jobs:
        job_vector = extract_features(job)
        similarity = cosine_similarity(user_vector, job_vector)
        similarities.append((job, similarity))
    
    # ترتيب حسب التشابه
    return sorted(similarities, key=lambda x: x[1], reverse=True)
```

### 3.2 Collaborative Filtering
يعتمد على سلوك مستخدمين مشابهين.

```python
def collaborative_filtering(user_id, user_item_matrix):
    # إيجاد مستخدمين مشابهين
    similar_users = find_similar_users(user_id, user_item_matrix)
    
    # جمع الوظائف التي أعجبتهم
    recommended_jobs = []
    for similar_user in similar_users:
        jobs = get_liked_jobs(similar_user)
        recommended_jobs.extend(jobs)
    
    # ترتيب حسب الشعبية
    return rank_by_popularity(recommended_jobs)
```

### 3.3 Hybrid Approach
دمج Content-Based و Collaborative Filtering.

```python
def hybrid_recommendation(user_id, user_profile, jobs):
    # توصيات content-based
    content_recs = content_based_recommendation(user_profile, jobs)
    
    # توصيات collaborative
    collab_recs = collaborative_filtering(user_id, user_item_matrix)
    
    # دمج النتائج بأوزان
    final_recs = merge_recommendations(
        content_recs, weight=0.6,
        collab_recs, weight=0.4
    )
    
    return final_recs
```

## 4. Feature Engineering

### User Features
- المهارات (skills vector)
- الخبرة (years, level)
- التعليم (degree, field)
- الموقع (location embedding)
- التفضيلات (preferences)
- التفاعلات السابقة (interaction history)

### Job Features
- المهارات المطلوبة (required skills)
- مستوى الخبرة (experience level)
- الموقع (location)
- الراتب (salary range)
- نوع العمل (work type)
- الشركة (company profile)

### Text Embeddings
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def get_text_embedding(text):
    return model.encode(text)

# استخدام
job_description_embedding = get_text_embedding(job.description)
user_bio_embedding = get_text_embedding(user.bio)
```

## 5. Data Models

### Recommendation Model
```javascript
{
  recommendationId: UUID,
  userId: ObjectId,
  itemType: 'job' | 'course' | 'candidate',
  itemId: ObjectId,
  score: Number,           // 0-100
  confidence: Number,      // 0-1
  reasons: [String],       // شرح التوصية
  features: Object,        // features المستخدمة
  modelVersion: String,
  createdAt: Date,
  expiresAt: Date
}
```

### UserInteraction Model
```javascript
{
  userId: ObjectId,
  itemType: 'job' | 'course',
  itemId: ObjectId,
  action: 'view' | 'like' | 'apply' | 'ignore' | 'save',
  duration: Number,        // مدة المشاهدة
  timestamp: Date,
  context: Object          // سياق التفاعل
}
```

### MLModel Model
```javascript
{
  modelId: String,
  modelType: 'content_based' | 'collaborative' | 'hybrid',
  version: String,
  accuracy: Number,
  precision: Number,
  recall: Number,
  f1Score: Number,
  trainingDate: Date,
  isActive: Boolean,
  hyperparameters: Object,
  features: [String]
}
```

### ProfileAnalysis Model
```javascript
{
  userId: ObjectId,
  completenessScore: Number,  // 0-100
  strengthScore: Number,      // 0-100
  suggestions: [{
    category: String,
    priority: 'high' | 'medium' | 'low',
    suggestion: String,
    impact: Number            // تأثير متوقع
  }],
  skillGaps: [String],
  analyzedAt: Date
}
```

## 6. Correctness Properties

### Property 1: Recommendation Relevance
*For any* user with a complete profile, at least 75% of recommended jobs should match their skills and experience level.
**Validates: Requirements 1.1**

### Property 2: Score Consistency
*For any* recommendation, the score should be between 0 and 100, and higher scores should indicate better matches.
**Validates: Requirements 1.4**

### Property 3: Explanation Completeness
*For any* recommendation, there should be at least one reason explaining why it was recommended.
**Validates: Requirements 1.3**

### Property 4: CV Parsing Accuracy
*For any* valid CV file, the system should extract at least 90% of the skills and experiences correctly.
**Validates: Requirements 4.2**

### Property 5: Profile Completeness Calculation
*For any* user profile, the completeness score should equal (filled fields / total fields) × 100.
**Validates: Requirements 5.2**

### Property 6: Learning from Interactions
*For any* user who interacts with recommendations (like, apply, ignore), subsequent recommendations should reflect these preferences.
**Validates: Requirements 6.2**

### Property 7: Real-time Update
*For any* profile update, new recommendations should be generated within 1 minute.
**Validates: Requirements 1.5, 7.2**

### Property 8: Skill Gap Identification
*For any* user profile and target job, the system should identify all skills present in the job but missing from the profile.
**Validates: Requirements 2.1**

### Property 9: Candidate Ranking Accuracy
*For any* job posting, candidates should be ranked such that those with higher match scores appear first.
**Validates: Requirements 3.2**

### Property 10: Diversity in Recommendations
*For any* set of recommendations, there should be diversity in job types, companies, and locations (not all similar).
**Validates: Requirements 1.1**

## 7. ML Model Training

### Training Pipeline
```python
class RecommendationModel:
    def __init__(self):
        self.content_model = ContentBasedModel()
        self.collab_model = CollaborativeModel()
        
    def train(self, training_data):
        # تقسيم البيانات
        X_train, X_test, y_train, y_test = train_test_split(
            training_data, test_size=0.2
        )
        
        # تدريب النماذج
        self.content_model.fit(X_train, y_train)
        self.collab_model.fit(X_train, y_train)
        
        # تقييم
        content_score = self.content_model.score(X_test, y_test)
        collab_score = self.collab_model.score(X_test, y_test)
        
        return {
            'content_accuracy': content_score,
            'collab_accuracy': collab_score
        }
    
    def predict(self, user_profile, jobs):
        # توصيات من كلا النموذجين
        content_recs = self.content_model.predict(user_profile, jobs)
        collab_recs = self.collab_model.predict(user_profile, jobs)
        
        # دمج النتائج
        return self.merge(content_recs, collab_recs)
```

### Evaluation Metrics
- **Precision@K**: دقة أفضل K توصية
- **Recall@K**: تغطية أفضل K توصية
- **NDCG**: Normalized Discounted Cumulative Gain
- **MRR**: Mean Reciprocal Rank
- **CTR**: Click-Through Rate

## 8. CV Parsing with NLP

```python
import spacy
from pdfminer.high_level import extract_text

class CVParser:
    def __init__(self):
        self.nlp = spacy.load('en_core_web_sm')
        
    def parse_cv(self, file_path):
        # استخراج النص
        text = extract_text(file_path)
        
        # معالجة NLP
        doc = self.nlp(text)
        
        # استخراج المعلومات
        skills = self.extract_skills(doc)
        experience = self.extract_experience(doc)
        education = self.extract_education(doc)
        
        return {
            'skills': skills,
            'experience': experience,
            'education': education,
            'raw_text': text
        }
    
    def extract_skills(self, doc):
        # قائمة مهارات معروفة
        known_skills = load_skills_database()
        
        # البحث عن المهارات في النص
        found_skills = []
        for token in doc:
            if token.text.lower() in known_skills:
                found_skills.append(token.text)
        
        return list(set(found_skills))
```

## 9. Testing Strategy
- Property-based tests using fast-check
- Unit tests for ML models
- Integration tests for recommendation pipeline
- A/B testing for model comparison
- User feedback analysis

**تاريخ الإنشاء**: 2026-02-17
