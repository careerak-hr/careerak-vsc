# تحسينات صفحة التسجيل - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: تحسينات صفحة التسجيل (Enhanced Auth Page)
- **تاريخ الإنشاء**: 2026-02-18
- **الحالة**: قيد التصميم

## 1. Overview
تحسينات شاملة لصفحة التسجيل تتضمن OAuth، مؤشر قوة كلمة المرور، اقتراحات كلمات مرور، التحقق الفوري من البريد، Stepper، وحفظ تلقائي.

## 2. Architecture

### System Architecture
```
Frontend (React)
    ↓
Auth Service → OAuth Providers (Google, Facebook, LinkedIn)
    ↓              ↓
Password       Email
Validator      Validator
    ↓              ↓
JWT Manager    Progress
               Saver
    ↓
MongoDB
```

### Component Structure
```
AuthPage
├── OAuthButtons (Google, Facebook, LinkedIn)
├── Divider ("أو")
├── StepperComponent
│   ├── Step 1: BasicInfo (الاسم، البريد)
│   ├── Step 2: Password (كلمة المرور)
│   │   ├── PasswordStrengthIndicator
│   │   └── PasswordGenerator
│   ├── Step 3: AccountType (نوع الحساب)
│   └── Step 4: Details (التفاصيل الإضافية)
├── EmailValidator
├── ProgressSaver
└── NavigationButtons (السابق، التالي، تخطي)
```

## 3. Data Models

### User Model (تحديثات)
```javascript
{
  // الحقول الموجودة...
  
  // حقول جديدة
  oauthAccounts: [{
    provider: 'google' | 'facebook' | 'linkedin',
    providerId: String,
    email: String,
    connectedAt: Date
  }],
  passwordStrength: {
    score: Number,      // 0-4
    label: String       // weak, fair, good, strong
  },
  emailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  registrationProgress: {
    step: Number,       // 1-4
    completed: Boolean,
    lastSaved: Date,
    data: Object        // بيانات مؤقتة
  }
}
```

### OAuthAccount Model
```javascript
{
  userId: ObjectId,
  provider: 'google' | 'facebook' | 'linkedin',
  providerId: String,
  email: String,
  displayName: String,
  profilePicture: String,
  accessToken: String,      // encrypted
  refreshToken: String,     // encrypted
  tokenExpires: Date,
  connectedAt: Date,
  lastUsed: Date
}
```

### PasswordReset Model
```javascript
{
  userId: ObjectId,
  token: String,
  expires: Date,
  used: Boolean,
  createdAt: Date
}
```

### EmailVerification Model
```javascript
{
  userId: ObjectId,
  email: String,
  token: String,
  expires: Date,
  verified: Boolean,
  createdAt: Date
}
```

## 4. OAuth Integration

### Google OAuth Flow
```javascript
// Backend - Passport.js Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // البحث عن حساب موجود
      let user = await User.findOne({ 
        'oauthAccounts.provider': 'google',
        'oauthAccounts.providerId': profile.id
      });
      
      if (!user) {
        // إنشاء حساب جديد
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          emailVerified: true,  // Google verified
          oauthAccounts: [{
            provider: 'google',
            providerId: profile.id,
            email: profile.emails[0].value,
            connectedAt: new Date()
          }]
        });
      }
      
      // حفظ/تحديث OAuth account
      await OAuthAccount.findOneAndUpdate(
        { userId: user._id, provider: 'google' },
        {
          providerId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos[0].value,
          accessToken: encrypt(accessToken),
          refreshToken: encrypt(refreshToken),
          lastUsed: new Date()
        },
        { upsert: true }
      );
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // إنشاء JWT token
    const token = generateJWT(req.user);
    res.redirect(`/auth/success?token=${token}`);
  }
);
```

### Frontend - OAuth Button
```jsx
function OAuthButtons() {
  const handleOAuthLogin = (provider) => {
    // فتح نافذة OAuth
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      `/auth/${provider}`,
      'OAuth Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // الاستماع لرسالة النجاح
    window.addEventListener('message', (event) => {
      if (event.data.type === 'oauth-success') {
        const { token, user } = event.data;
        // حفظ token
        localStorage.setItem('authToken', token);
        // إعادة توجيه
        window.location.href = '/dashboard';
      }
    });
  };
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => handleOAuthLogin('google')}
        className="oauth-button google"
      >
        <GoogleIcon />
        <span>تسجيل بـ Google</span>
      </button>
      
      <button
        onClick={() => handleOAuthLogin('facebook')}
        className="oauth-button facebook"
      >
        <FacebookIcon />
        <span>تسجيل بـ Facebook</span>
      </button>
      
      <button
        onClick={() => handleOAuthLogin('linkedin')}
        className="oauth-button linkedin"
      >
        <LinkedInIcon />
        <span>تسجيل بـ LinkedIn</span>
      </button>
    </div>
  );
}
```

## 5. Password Strength Indicator

### Password Strength Calculator
```javascript
// استخدام zxcvbn library
import zxcvbn from 'zxcvbn';

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'none', feedback: [] };
  
  const result = zxcvbn(password);
  
  const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#eab308', '#10b981'];
  
  // التحقق من المتطلبات
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  return {
    score: result.score,
    label: labels[result.score],
    color: colors[result.score],
    percentage: (result.score / 4) * 100,
    requirements,
    feedback: result.feedback.suggestions,
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
  };
}
```

### Password Strength Component
```jsx
function PasswordStrengthIndicator({ password }) {
  const strength = calculatePasswordStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      
      {/* Label */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm" style={{ color: strength.color }}>
          {getStrengthLabel(strength.label)}
        </span>
        <span className="text-xs text-gray-500">
          وقت الاختراق: {strength.crackTime}
        </span>
      </div>
      
      {/* Requirements Checklist */}
      <div className="mt-3 space-y-1">
        <RequirementItem 
          met={strength.requirements.length}
          text="8 أحرف على الأقل"
        />
        <RequirementItem 
          met={strength.requirements.uppercase}
          text="حرف كبير واحد على الأقل"
        />
        <RequirementItem 
          met={strength.requirements.lowercase}
          text="حرف صغير واحد على الأقل"
        />
        <RequirementItem 
          met={strength.requirements.number}
          text="رقم واحد على الأقل"
        />
        <RequirementItem 
          met={strength.requirements.special}
          text="رمز خاص واحد على الأقل"
        />
      </div>
      
      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">نصائح:</p>
          <ul className="list-disc list-inside">
            {strength.feedback.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle className="text-green-500" size={16} />
      ) : (
        <XCircle className="text-gray-400" size={16} />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}
```

## 6. Password Generator

### Password Generation Algorithm
```javascript
function generateStrongPassword(length = 14) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // ضمان وجود حرف واحد من كل نوع
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // ملء الباقي عشوائياً
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // خلط الأحرف
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
```

### Password Generator Component
```jsx
function PasswordGenerator({ onGenerate }) {
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  
  const handleGenerate = () => {
    const password = generateStrongPassword();
    setGenerated(password);
    onGenerate(password);
    setCopied(false);
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleGenerate}
        className="text-sm text-primary hover:underline"
      >
        🔑 اقتراح كلمة مرور قوية
      </button>
      
      {generated && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <code className="flex-1 font-mono text-sm">
              {generated}
            </code>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-icon"
                title="نسخ"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              
              <button
                type="button"
                onClick={handleGenerate}
                className="btn-icon"
                title="توليد جديد"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          
          {copied && (
            <p className="text-xs text-green-600 mt-1">
              ✓ تم النسخ!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## 7. Email Validation

### Email Validator with Typo Correction
```javascript
import validator from 'validator';
import emailTypo from 'email-typo';

async function validateEmail(email) {
  // 1. التحقق من الصيغة
  if (!validator.isEmail(email)) {
    return {
      valid: false,
      error: 'البريد الإلكتروني غير صحيح'
    };
  }
  
  // 2. التحقق من الأخطاء الشائعة
  const suggestion = emailTypo.run(email);
  if (suggestion) {
    return {
      valid: false,
      error: 'هل تقصد',
      suggestion: suggestion.full
    };
  }
  
  // 3. التحقق من الوجود في قاعدة البيانات
  const exists = await User.exists({ email });
  if (exists) {
    return {
      valid: false,
      error: 'هذا البريد مستخدم بالفعل',
      action: 'login'
    };
  }
  
  return {
    valid: true
  };
}
```

### Email Validator Component
```jsx
function EmailValidator({ value, onChange }) {
  const [validation, setValidation] = useState(null);
  const [checking, setChecking] = useState(false);
  
  // Debounced validation
  useEffect(() => {
    if (!value) {
      setValidation(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      setChecking(true);
      const result = await validateEmail(value);
      setValidation(result);
      setChecking(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  return (
    <div className="relative">
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${validation?.valid === false ? 'border-red-500' : ''}`}
        placeholder="البريد الإلكتروني"
      />
      
      {/* Status Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {checking && <Loader className="animate-spin" size={20} />}
        {!checking && validation?.valid && (
          <CheckCircle className="text-green-500" size={20} />
        )}
        {!checking && validation?.valid === false && (
          <XCircle className="text-red-500" size={20} />
        )}
      </div>
      
      {/* Error/Suggestion Message */}
      {validation?.valid === false && (
        <div className="mt-1 text-sm text-red-600">
          {validation.error}
          {validation.suggestion && (
            <button
              type="button"
              onClick={() => onChange(validation.suggestion)}
              className="ml-2 text-primary hover:underline"
            >
              {validation.suggestion}
            </button>
          )}
          {validation.action === 'login' && (
            <a href="/login" className="ml-2 text-primary hover:underline">
              تسجيل الدخول
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

## 8. Stepper Component

### Stepper Logic
```jsx
function StepperComponent({ currentStep, totalSteps, onStepChange }) {
  const steps = [
    { number: 1, title: 'المعلومات الأساسية', icon: User },
    { number: 2, title: 'كلمة المرور', icon: Lock },
    { number: 3, title: 'نوع الحساب', icon: Briefcase },
    { number: 4, title: 'التفاصيل', icon: FileText }
  ];
  
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Steps */}
      <div className="flex justify-between mt-4">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;
          
          return (
            <div
              key={step.number}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => step.number < currentStep && onStepChange(step.number)}
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? (
                  <Check size={24} />
                ) : (
                  <Icon size={24} />
                )}
              </div>
              
              <span
                className={`
                  mt-2 text-sm text-center
                  ${isCurrent ? 'font-semibold text-primary' : 'text-gray-600'}
                `}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## 9. Progress Saver

### Auto-save Logic
```javascript
const STORAGE_KEY = 'registration_progress';
const EXPIRY_DAYS = 7;

class ProgressSaver {
  save(step, data) {
    const progress = {
      step,
      data: {
        ...data,
        password: undefined  // لا نحفظ كلمة المرور
      },
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
  
  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const progress = JSON.parse(saved);
    
    // التحقق من انتهاء الصلاحية
    if (new Date(progress.expiresAt) < new Date()) {
      this.clear();
      return null;
    }
    
    return progress;
  }
  
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// React Hook
function useProgressSaver() {
  const saver = new ProgressSaver();
  
  const saveProgress = useCallback((step, data) => {
    saver.save(step, data);
  }, []);
  
  const loadProgress = useCallback(() => {
    return saver.load();
  }, []);
  
  const clearProgress = useCallback(() => {
    saver.clear();
  }, []);
  
  return { saveProgress, loadProgress, clearProgress };
}
```

### Progress Restoration Component
```jsx
function ProgressRestoration({ onRestore, onClear }) {
  const { loadProgress } = useProgressSaver();
  const [savedProgress, setSavedProgress] = useState(null);
  
  useEffect(() => {
    const progress = loadProgress();
    if (progress) {
      setSavedProgress(progress);
    }
  }, []);
  
  if (!savedProgress) return null;
  
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="text-blue-600 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="font-semibold text-blue-900">
            لديك تسجيل غير مكتمل
          </p>
          <p className="text-sm text-blue-700 mt-1">
            آخر حفظ: {formatDate(savedProgress.savedAt)}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => onRestore(savedProgress)}
          className="btn-primary"
        >
          المتابعة من حيث توقفت
        </button>
        <button
          onClick={onClear}
          className="btn-outline"
        >
          بدء من جديد
        </button>
      </div>
    </div>
  );
}
```

## 10. Correctness Properties

### Property 1: OAuth Account Uniqueness
*For any* user and OAuth provider, there should be at most one OAuthAccount record.
**Validates: Requirements 1.5**

### Property 2: Password Strength Consistency
*For any* password, if it meets all 5 requirements (length, uppercase, lowercase, number, special), the strength score should be ≥ 3.
**Validates: Requirements 2.1**

### Property 3: Email Format Validation
*For any* email input, it should match the standard email regex pattern before being accepted.
**Validates: Requirements 4.1**

### Property 4: Email Uniqueness
*For any* new registration, the email should not exist in the database.
**Validates: Requirements 4.4**

### Property 5: Stepper Progress
*For any* stepper state, currentStep should be between 1 and totalSteps inclusive.
**Validates: Requirements 5.1**

### Property 6: Progress Expiry
*For any* saved progress, if expiresAt < current time, the progress should be cleared.
**Validates: Requirements 6.6**

### Property 7: Password Not Saved
*For any* saved progress in localStorage, the password field should be undefined or null.
**Validates: Requirements 6.7**

### Property 8: JWT Token Expiry
*For any* JWT token, it should have an expiration time set.
**Validates: Requirements 7.2**

### Property 9: Password Hash
*For any* stored password, it should be hashed with bcrypt (not plain text).
**Validates: Requirements 7.1**

### Property 10: OAuth State Parameter
*For any* OAuth flow, a state parameter should be generated and verified to prevent CSRF.
**Validates: Requirements 1.1**

## 11. Security Best Practices

### Password Hashing
```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### JWT Token Generation
```javascript
const jwt = require('jsonwebtoken');

function generateJWT(user) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );
}
```

## 12. Testing Strategy
- Property-based tests for password strength
- Unit tests for email validation
- Integration tests for OAuth flow
- E2E tests for registration process
- Security tests for password hashing

**تاريخ الإنشاء**: 2026-02-18
