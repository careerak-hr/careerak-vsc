/**
 * SEO Metadata Configuration
 * 
 * Centralized SEO metadata for all pages in the application.
 * Each page has title, description, and keywords optimized for search engines.
 * 
 * Requirements:
 * - FR-SEO-1: Unique, descriptive title tags (50-60 characters)
 * - FR-SEO-2: Unique meta descriptions (150-160 characters)
 * - FR-SEO-3: Relevant meta keywords
 * 
 * Multi-language Support:
 * - Arabic (ar): Primary language
 * - English (en): Secondary language
 * - French (fr): Tertiary language
 */

const seoMetadata = {
  // Language Selection Page
  language: {
    ar: {
      title: 'اختر اللغة - Careerak | منصة التوظيف والموارد البشرية',
      description: 'اختر لغتك المفضلة للبدء في استخدام Careerak، منصة التوظيف والموارد البشرية الرائدة في العالم العربي. ندعم العربية والإنجليزية والفرنسية.',
      keywords: 'اختيار اللغة, Careerak, توظيف, موارد بشرية, وظائف, دورات تدريبية',
      image: '/og-images/language.jpg',
      url: '/language'
    },
    en: {
      title: 'Choose Language - Careerak | HR & Career Platform',
      description: 'Select your preferred language to start using Careerak, the leading HR and career platform in the Arab world. We support Arabic, English, and French.',
      keywords: 'language selection, Careerak, jobs, HR, careers, training courses',
      image: '/og-images/language.jpg',
      url: '/language'
    },
    fr: {
      title: 'Choisir la langue - Careerak | Plateforme RH',
      description: 'Sélectionnez votre langue préférée pour commencer à utiliser Careerak, la plateforme RH et carrière leader dans le monde arabe. Nous supportons arabe, anglais et français.',
      keywords: 'sélection de langue, Careerak, emplois, RH, carrières, cours',
      image: '/og-images/language.jpg',
      url: '/language'
    }
  },

  // Entry Page
  entry: {
    ar: {
      title: 'مرحباً بك في Careerak - منصة التوظيف والموارد البشرية',
      description: 'ابدأ رحلتك المهنية مع Careerak. منصة شاملة للتوظيف، الدورات التدريبية، والاستشارات المهنية في العالم العربي. سجل الآن مجاناً!',
      keywords: 'Careerak, توظيف, وظائف, موارد بشرية, دورات تدريبية, استشارات مهنية',
      image: '/og-images/entry.jpg',
      url: '/entry'
    },
    en: {
      title: 'Welcome to Careerak - HR & Career Development Platform',
      description: 'Start your career journey with Careerak. Comprehensive platform for jobs, training courses, and career consulting in the Arab world. Register now for free!',
      keywords: 'Careerak, jobs, careers, HR, training courses, career consulting',
      image: '/og-images/entry.jpg',
      url: '/entry'
    },
    fr: {
      title: 'Bienvenue sur Careerak - Plateforme RH et Carrière',
      description: 'Commencez votre parcours professionnel avec Careerak. Plateforme complète pour emplois, cours de formation et conseil en carrière dans le monde arabe. Inscrivez-vous gratuitement!',
      keywords: 'Careerak, emplois, carrières, RH, cours de formation, conseil',
      image: '/og-images/entry.jpg',
      url: '/entry'
    }
  },

  // Login Page
  login: {
    ar: {
      title: 'تسجيل الدخول - Careerak | الوصول إلى حسابك',
      description: 'سجل دخولك إلى حسابك في Careerak للوصول إلى فرص العمل، الدورات التدريبية، وإدارة ملفك الشخصي. منصة التوظيف الرائدة في العالم العربي.',
      keywords: 'تسجيل دخول, Careerak, حساب, وظائف, دورات, ملف شخصي',
      image: '/og-images/login.jpg',
      url: '/login'
    },
    en: {
      title: 'Login - Careerak | Access Your Account',
      description: 'Log in to your Careerak account to access job opportunities, training courses, and manage your profile. Leading career platform in the Arab world.',
      keywords: 'login, Careerak, account, jobs, courses, profile',
      image: '/og-images/login.jpg',
      url: '/login'
    },
    fr: {
      title: 'Connexion - Careerak | Accédez à votre compte',
      description: 'Connectez-vous à votre compte Careerak pour accéder aux opportunités d\'emploi, cours de formation et gérer votre profil. Plateforme carrière leader.',
      keywords: 'connexion, Careerak, compte, emplois, cours, profil',
      image: '/og-images/login.jpg',
      url: '/login'
    }
  },

  // Registration Page
  auth: {
    ar: {
      title: 'التسجيل - Careerak | إنشاء حساب جديد',
      description: 'أنشئ حسابك المجاني في Careerak اليوم. انضم إلى آلاف المستخدمين في البحث عن فرص العمل والدورات التدريبية في العالم العربي.',
      keywords: 'تسجيل, إنشاء حساب, Careerak, وظائف, دورات, مجاني',
      image: '/og-images/register.jpg',
      url: '/auth'
    },
    en: {
      title: 'Register - Careerak | Create New Account',
      description: 'Create your free Careerak account today. Join thousands of users searching for job opportunities and training courses in the Arab world.',
      keywords: 'register, create account, Careerak, jobs, courses, free',
      image: '/og-images/register.jpg',
      url: '/auth'
    },
    fr: {
      title: 'Inscription - Careerak | Créer un nouveau compte',
      description: 'Créez votre compte Careerak gratuit aujourd\'hui. Rejoignez des milliers d\'utilisateurs à la recherche d\'opportunités d\'emploi et de cours dans le monde arabe.',
      keywords: 'inscription, créer compte, Careerak, emplois, cours, gratuit',
      image: '/og-images/register.jpg',
      url: '/auth'
    }
  },

  // OTP Verification Page
  otp: {
    ar: {
      title: 'التحقق من الهاتف - Careerak | رمز التحقق OTP',
      description: 'أدخل رمز التحقق المرسل إلى هاتفك لإكمال عملية التسجيل في Careerak. حماية حسابك أولويتنا.',
      keywords: 'OTP, رمز التحقق, تحقق الهاتف, Careerak, أمان',
      image: '/og-images/otp.jpg',
      url: '/otp'
    },
    en: {
      title: 'Phone Verification - Careerak | OTP Code',
      description: 'Enter the verification code sent to your phone to complete your Careerak registration. Your account security is our priority.',
      keywords: 'OTP, verification code, phone verification, Careerak, security',
      image: '/og-images/otp.jpg',
      url: '/otp'
    },
    fr: {
      title: 'Vérification téléphone - Careerak | Code OTP',
      description: 'Entrez le code de vérification envoyé à votre téléphone pour compléter votre inscription Careerak. La sécurité de votre compte est notre priorité.',
      keywords: 'OTP, code vérification, vérification téléphone, Careerak, sécurité',
      image: '/og-images/otp.jpg',
      url: '/otp'
    }
  },

  // Profile Page
  profile: {
    ar: {
      title: 'الملف الشخصي - Careerak | إدارة حسابك ومهاراتك',
      description: 'أدر ملفك الشخصي في Careerak. حدّث سيرتك الذاتية، مهاراتك، وخبراتك لزيادة فرصك في الحصول على الوظيفة المثالية.',
      keywords: 'ملف شخصي, سيرة ذاتية, مهارات, خبرات, Careerak',
      image: '/og-images/profile.jpg',
      url: '/profile'
    },
    en: {
      title: 'Profile - Careerak | Manage Your Account & Skills',
      description: 'Manage your Careerak profile. Update your CV, skills, and experience to increase your chances of landing the perfect job.',
      keywords: 'profile, CV, resume, skills, experience, Careerak',
      image: '/og-images/profile.jpg',
      url: '/profile'
    },
    fr: {
      title: 'Profil - Careerak | Gérez votre compte et compétences',
      description: 'Gérez votre profil Careerak. Mettez à jour votre CV, compétences et expérience pour augmenter vos chances d\'obtenir l\'emploi parfait.',
      keywords: 'profil, CV, compétences, expérience, Careerak',
      image: '/og-images/profile.jpg',
      url: '/profile'
    }
  },

  // Job Postings Page
  jobPostings: {
    ar: {
      title: 'فرص العمل - Careerak | ابحث عن وظيفتك المثالية',
      description: 'تصفح آلاف فرص العمل في مختلف المجالات والتخصصات. ابحث عن الوظيفة المناسبة لمهاراتك وخبراتك في العالم العربي مع Careerak.',
      keywords: 'وظائف, فرص عمل, توظيف, بحث عن وظيفة, Careerak',
      image: '/og-images/jobs.jpg',
      url: '/jobs'
    },
    en: {
      title: 'Job Opportunities - Careerak | Find Your Perfect Job',
      description: 'Browse thousands of job opportunities across various fields and specializations. Find the right job for your skills and experience in the Arab world with Careerak.',
      keywords: 'jobs, job opportunities, employment, job search, Careerak',
      image: '/og-images/jobs.jpg',
      url: '/jobs'
    },
    fr: {
      title: 'Opportunités d\'emploi - Careerak | Trouvez votre emploi',
      description: 'Parcourez des milliers d\'opportunités d\'emploi dans divers domaines et spécialisations. Trouvez l\'emploi adapté à vos compétences dans le monde arabe avec Careerak.',
      keywords: 'emplois, opportunités, recrutement, recherche emploi, Careerak',
      image: '/og-images/jobs.jpg',
      url: '/jobs'
    }
  },

  // Post Job Page
  postJob: {
    ar: {
      title: 'نشر وظيفة - Careerak | وظف أفضل المواهب',
      description: 'انشر إعلان وظيفة على Careerak واحصل على أفضل المرشحين. منصة التوظيف الرائدة تربطك بآلاف الباحثين عن عمل المؤهلين.',
      keywords: 'نشر وظيفة, توظيف, إعلان وظيفة, مواهب, Careerak',
      image: '/og-images/post-job.jpg',
      url: '/post-job'
    },
    en: {
      title: 'Post a Job - Careerak | Hire Top Talent',
      description: 'Post a job listing on Careerak and get the best candidates. Leading recruitment platform connects you with thousands of qualified job seekers.',
      keywords: 'post job, recruitment, job listing, talent, Careerak',
      image: '/og-images/post-job.jpg',
      url: '/post-job'
    },
    fr: {
      title: 'Publier une offre - Careerak | Recrutez les meilleurs',
      description: 'Publiez une offre d\'emploi sur Careerak et obtenez les meilleurs candidats. Plateforme de recrutement leader vous connecte à des milliers de chercheurs d\'emploi qualifiés.',
      keywords: 'publier offre, recrutement, annonce emploi, talents, Careerak',
      image: '/og-images/post-job.jpg',
      url: '/post-job'
    }
  },

  // Courses Page
  courses: {
    ar: {
      title: 'الدورات التدريبية - Careerak | طور مهاراتك المهنية',
      description: 'اكتشف مئات الدورات التدريبية والتعليمية في مختلف المجالات. طور مهاراتك وعزز فرصك المهنية مع دورات Careerak المعتمدة.',
      keywords: 'دورات تدريبية, تعليم, مهارات, تطوير مهني, Careerak',
      image: '/og-images/courses.jpg',
      url: '/courses'
    },
    en: {
      title: 'Training Courses - Careerak | Develop Your Skills',
      description: 'Discover hundreds of training and educational courses across various fields. Develop your skills and enhance your career opportunities with Careerak certified courses.',
      keywords: 'training courses, education, skills, professional development, Careerak',
      image: '/og-images/courses.jpg',
      url: '/courses'
    },
    fr: {
      title: 'Cours de formation - Careerak | Développez vos compétences',
      description: 'Découvrez des centaines de cours de formation et d\'éducation dans divers domaines. Développez vos compétences et améliorez vos opportunités de carrière avec Careerak.',
      keywords: 'cours formation, éducation, compétences, développement professionnel, Careerak',
      image: '/og-images/courses.jpg',
      url: '/courses'
    }
  },

  // Post Course Page
  postCourse: {
    ar: {
      title: 'نشر دورة تدريبية - Careerak | شارك خبرتك',
      description: 'انشر دورتك التدريبية على Careerak وشارك خبرتك مع آلاف المتعلمين. منصة التعليم الرائدة في العالم العربي.',
      keywords: 'نشر دورة, تدريب, تعليم, خبرة, Careerak',
      image: '/og-images/post-course.jpg',
      url: '/post-course'
    },
    en: {
      title: 'Post a Course - Careerak | Share Your Expertise',
      description: 'Post your training course on Careerak and share your expertise with thousands of learners. Leading education platform in the Arab world.',
      keywords: 'post course, training, education, expertise, Careerak',
      image: '/og-images/post-course.jpg',
      url: '/post-course'
    },
    fr: {
      title: 'Publier un cours - Careerak | Partagez votre expertise',
      description: 'Publiez votre cours de formation sur Careerak et partagez votre expertise avec des milliers d\'apprenants. Plateforme d\'éducation leader dans le monde arabe.',
      keywords: 'publier cours, formation, éducation, expertise, Careerak',
      image: '/og-images/post-course.jpg',
      url: '/post-course'
    }
  },

  // Apply Page
  apply: {
    ar: {
      title: 'التقديم على وظيفة - Careerak | أرسل طلبك',
      description: 'قدم طلبك للوظيفة المناسبة عبر Careerak. نظام تقديم سهل وسريع يربطك مباشرة بأصحاب العمل.',
      keywords: 'التقديم على وظيفة, طلب توظيف, سيرة ذاتية, Careerak',
      image: '/og-images/apply.jpg',
      url: '/apply'
    },
    en: {
      title: 'Apply for Job - Careerak | Submit Your Application',
      description: 'Submit your application for the right job through Careerak. Easy and fast application system connects you directly with employers.',
      keywords: 'apply for job, job application, resume, Careerak',
      image: '/og-images/apply.jpg',
      url: '/apply'
    },
    fr: {
      title: 'Postuler - Careerak | Soumettez votre candidature',
      description: 'Soumettez votre candidature pour l\'emploi approprié via Careerak. Système de candidature facile et rapide vous connecte directement aux employeurs.',
      keywords: 'postuler emploi, candidature, CV, Careerak',
      image: '/og-images/apply.jpg',
      url: '/apply'
    }
  },

  // Settings Page
  settings: {
    ar: {
      title: 'الإعدادات - Careerak | تخصيص حسابك',
      description: 'أدر إعدادات حسابك في Careerak. تحكم في الخصوصية، الإشعارات، اللغة، والمظهر لتجربة مخصصة.',
      keywords: 'إعدادات, تخصيص, خصوصية, إشعارات, Careerak',
      image: '/og-images/settings.jpg',
      url: '/settings'
    },
    en: {
      title: 'Settings - Careerak | Customize Your Account',
      description: 'Manage your Careerak account settings. Control privacy, notifications, language, and appearance for a personalized experience.',
      keywords: 'settings, customization, privacy, notifications, Careerak',
      image: '/og-images/settings.jpg',
      url: '/settings'
    },
    fr: {
      title: 'Paramètres - Careerak | Personnalisez votre compte',
      description: 'Gérez les paramètres de votre compte Careerak. Contrôlez la confidentialité, les notifications, la langue et l\'apparence pour une expérience personnalisée.',
      keywords: 'paramètres, personnalisation, confidentialité, notifications, Careerak',
      image: '/og-images/settings.jpg',
      url: '/settings'
    }
  },

  // Privacy Policy Page
  policy: {
    ar: {
      title: 'سياسة الخصوصية - Careerak | حماية بياناتك',
      description: 'اقرأ سياسة الخصوصية الخاصة بـ Careerak. نحن ملتزمون بحماية بياناتك الشخصية وخصوصيتك وفقاً لأعلى المعايير.',
      keywords: 'سياسة الخصوصية, حماية البيانات, خصوصية, أمان, Careerak',
      image: '/og-images/policy.jpg',
      url: '/policy'
    },
    en: {
      title: 'Privacy Policy - Careerak | Protecting Your Data',
      description: 'Read Careerak\'s privacy policy. We are committed to protecting your personal data and privacy according to the highest standards.',
      keywords: 'privacy policy, data protection, privacy, security, Careerak',
      image: '/og-images/policy.jpg',
      url: '/policy'
    },
    fr: {
      title: 'Politique de confidentialité - Careerak | Protection',
      description: 'Lisez la politique de confidentialité de Careerak. Nous nous engageons à protéger vos données personnelles et votre vie privée selon les normes les plus élevées.',
      keywords: 'politique confidentialité, protection données, confidentialité, sécurité, Careerak',
      image: '/og-images/policy.jpg',
      url: '/policy'
    }
  },

  // Notifications Page
  notifications: {
    ar: {
      title: 'الإشعارات - Careerak | تابع آخر التحديثات',
      description: 'تابع جميع إشعاراتك في Careerak. ابق على اطلاع بفرص العمل الجديدة، تحديثات الطلبات، والرسائل المهمة.',
      keywords: 'إشعارات, تحديثات, رسائل, تنبيهات, Careerak',
      image: '/og-images/notifications.jpg',
      url: '/notifications'
    },
    en: {
      title: 'Notifications - Careerak | Stay Updated',
      description: 'Follow all your notifications in Careerak. Stay informed about new job opportunities, application updates, and important messages.',
      keywords: 'notifications, updates, messages, alerts, Careerak',
      image: '/og-images/notifications.jpg',
      url: '/notifications'
    },
    fr: {
      title: 'Notifications - Careerak | Restez informé',
      description: 'Suivez toutes vos notifications dans Careerak. Restez informé des nouvelles opportunités d\'emploi, mises à jour de candidatures et messages importants.',
      keywords: 'notifications, mises à jour, messages, alertes, Careerak',
      image: '/og-images/notifications.jpg',
      url: '/notifications'
    }
  },

  // Admin Dashboard
  adminDashboard: {
    ar: {
      title: 'لوحة التحكم - Careerak Admin | إدارة المنصة',
      description: 'لوحة تحكم المسؤول في Careerak. أدر المستخدمين، الوظائف، الدورات، والإحصائيات من مكان واحد.',
      keywords: 'لوحة تحكم, إدارة, مسؤول, Careerak, admin',
      image: '/og-images/admin.jpg',
      url: '/admin'
    },
    en: {
      title: 'Admin Dashboard - Careerak | Platform Management',
      description: 'Careerak admin dashboard. Manage users, jobs, courses, and statistics from one place.',
      keywords: 'admin dashboard, management, administrator, Careerak, admin',
      image: '/og-images/admin.jpg',
      url: '/admin'
    },
    fr: {
      title: 'Tableau de bord Admin - Careerak | Gestion plateforme',
      description: 'Tableau de bord administrateur Careerak. Gérez les utilisateurs, emplois, cours et statistiques depuis un seul endroit.',
      keywords: 'tableau de bord admin, gestion, administrateur, Careerak, admin',
      image: '/og-images/admin.jpg',
      url: '/admin'
    }
  },

  // Onboarding Pages
  onboardingIndividuals: {
    ar: {
      title: 'إعداد الحساب - Careerak | الأفراد',
      description: 'أكمل إعداد حسابك كفرد في Careerak. أضف معلوماتك الشخصية والمهنية للبدء في البحث عن فرص العمل.',
      keywords: 'إعداد حساب, أفراد, معلومات شخصية, Careerak',
      image: '/og-images/onboarding-individuals.jpg',
      url: '/onboarding/individuals'
    },
    en: {
      title: 'Account Setup - Careerak | Individuals',
      description: 'Complete your individual account setup in Careerak. Add your personal and professional information to start searching for job opportunities.',
      keywords: 'account setup, individuals, personal information, Careerak',
      image: '/og-images/onboarding-individuals.jpg',
      url: '/onboarding/individuals'
    },
    fr: {
      title: 'Configuration compte - Careerak | Particuliers',
      description: 'Complétez la configuration de votre compte individuel dans Careerak. Ajoutez vos informations personnelles et professionnelles pour commencer à chercher des emplois.',
      keywords: 'configuration compte, particuliers, informations personnelles, Careerak',
      image: '/og-images/onboarding-individuals.jpg',
      url: '/onboarding/individuals'
    }
  },

  onboardingCompanies: {
    ar: {
      title: 'إعداد الحساب - Careerak | الشركات',
      description: 'أكمل إعداد حساب شركتك في Careerak. أضف معلومات الشركة والبدء في نشر الوظائف والبحث عن المواهب.',
      keywords: 'إعداد حساب, شركات, معلومات الشركة, Careerak',
      image: '/og-images/onboarding-companies.jpg',
      url: '/onboarding/companies'
    },
    en: {
      title: 'Account Setup - Careerak | Companies',
      description: 'Complete your company account setup in Careerak. Add company information and start posting jobs and searching for talent.',
      keywords: 'account setup, companies, company information, Careerak',
      image: '/og-images/onboarding-companies.jpg',
      url: '/onboarding/companies'
    },
    fr: {
      title: 'Configuration compte - Careerak | Entreprises',
      description: 'Complétez la configuration du compte de votre entreprise dans Careerak. Ajoutez les informations de l\'entreprise et commencez à publier des emplois.',
      keywords: 'configuration compte, entreprises, informations entreprise, Careerak',
      image: '/og-images/onboarding-companies.jpg',
      url: '/onboarding/companies'
    }
  },

  // Interface Pages
  interfaceIndividuals: {
    ar: {
      title: 'واجهة الأفراد - Careerak | لوحة التحكم الشخصية',
      description: 'واجهة الأفراد في Careerak. أدر طلباتك، تابع فرص العمل، وتواصل مع الشركات من لوحة تحكم واحدة.',
      keywords: 'واجهة أفراد, لوحة تحكم, طلبات, Careerak',
      image: '/og-images/interface-individuals.jpg',
      url: '/interface/individuals'
    },
    en: {
      title: 'Individuals Interface - Careerak | Personal Dashboard',
      description: 'Individuals interface in Careerak. Manage your applications, follow job opportunities, and communicate with companies from one dashboard.',
      keywords: 'individuals interface, dashboard, applications, Careerak',
      image: '/og-images/interface-individuals.jpg',
      url: '/interface/individuals'
    },
    fr: {
      title: 'Interface Particuliers - Careerak | Tableau de bord',
      description: 'Interface particuliers dans Careerak. Gérez vos candidatures, suivez les opportunités d\'emploi et communiquez avec les entreprises depuis un tableau de bord.',
      keywords: 'interface particuliers, tableau de bord, candidatures, Careerak',
      image: '/og-images/interface-individuals.jpg',
      url: '/interface/individuals'
    }
  },

  interfaceCompanies: {
    ar: {
      title: 'واجهة الشركات - Careerak | لوحة تحكم الشركات',
      description: 'واجهة الشركات في Careerak. أدر إعلانات الوظائف، راجع الطلبات، وتواصل مع المرشحين من لوحة تحكم واحدة.',
      keywords: 'واجهة شركات, لوحة تحكم, وظائف, مرشحين, Careerak',
      image: '/og-images/interface-companies.jpg',
      url: '/interface/companies'
    },
    en: {
      title: 'Companies Interface - Careerak | Company Dashboard',
      description: 'Companies interface in Careerak. Manage job postings, review applications, and communicate with candidates from one dashboard.',
      keywords: 'companies interface, dashboard, jobs, candidates, Careerak',
      image: '/og-images/interface-companies.jpg',
      url: '/interface/companies'
    },
    fr: {
      title: 'Interface Entreprises - Careerak | Tableau de bord',
      description: 'Interface entreprises dans Careerak. Gérez les offres d\'emploi, examinez les candidatures et communiquez avec les candidats depuis un tableau de bord.',
      keywords: 'interface entreprises, tableau de bord, emplois, candidats, Careerak',
      image: '/og-images/interface-companies.jpg',
      url: '/interface/companies'
    }
  },

  // Default fallback for any page without specific metadata
  default: {
    ar: {
      title: 'Careerak - منصة التوظيف والموارد البشرية الرائدة',
      description: 'Careerak منصة شاملة للتوظيف والموارد البشرية في العالم العربي. ابحث عن وظائف، دورات تدريبية، واستشارات مهنية.',
      keywords: 'Careerak, توظيف, وظائف, موارد بشرية, دورات تدريبية',
      image: '/og-images/default.jpg',
      url: '/'
    },
    en: {
      title: 'Careerak - Leading HR & Career Development Platform',
      description: 'Careerak is a comprehensive HR and career platform in the Arab world. Search for jobs, training courses, and career consulting.',
      keywords: 'Careerak, jobs, careers, HR, training courses',
      image: '/og-images/default.jpg',
      url: '/'
    },
    fr: {
      title: 'Careerak - Plateforme RH et Carrière Leader',
      description: 'Careerak est une plateforme RH et carrière complète dans le monde arabe. Recherchez des emplois, cours de formation et conseil en carrière.',
      keywords: 'Careerak, emplois, carrières, RH, cours de formation',
      image: '/og-images/default.jpg',
      url: '/'
    }
  }
};

/**
 * Get SEO metadata for a specific page and language
 * @param {string} page - Page identifier (e.g., 'language', 'entry', 'login')
 * @param {string} language - Language code ('ar', 'en', 'fr')
 * @returns {Object} SEO metadata object with title, description, and keywords
 */
export const getSEOMetadata = (page, language = 'ar') => {
  const pageMetadata = seoMetadata[page] || seoMetadata.default;
  return pageMetadata[language] || pageMetadata.ar;
};

/**
 * Get dynamic SEO metadata with custom values
 * @param {string} page - Page identifier
 * @param {string} language - Language code
 * @param {Object} customData - Custom data to inject into metadata
 * @returns {Object} SEO metadata object
 */
export const getDynamicSEOMetadata = (page, language = 'ar', customData = {}) => {
  const baseMetadata = getSEOMetadata(page, language);
  
  // Replace placeholders in title and description
  let { title, description, keywords } = baseMetadata;
  
  if (customData.name) {
    title = title.replace('{name}', customData.name);
    description = description.replace('{name}', customData.name);
  }
  
  if (customData.title) {
    title = title.replace('{title}', customData.title);
    description = description.replace('{title}', customData.title);
  }
  
  return { title, description, keywords };
};

export default seoMetadata;
