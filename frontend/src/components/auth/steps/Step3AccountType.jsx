import React from 'react';
import './RegistrationSteps.css';

/**
 * Step 3: AccountType
 * الخطوة الثالثة - نوع الحساب
 * - باحث عن عمل (individual)
 * - شركة (company)
 * - مستقل (freelancer) - يمكن إضافته لاحقاً
 * 
 * Requirements: 5.1
 */
function Step3AccountType({ 
  userType,
  onUserTypeChange,
  language = 'ar'
}) {
  const isRTL = language === 'ar';
  
  // الترجمات
  const translations = {
    ar: {
      title: 'اختر نوع الحساب',
      individual: 'باحث عن عمل',
      individualDesc: 'أبحث عن فرص عمل ودورات تدريبية',
      company: 'شركة أو منشأة',
      companyDesc: 'أبحث عن موظفين وأقدم دورات تدريبية',
      freelancer: 'مستقل',
      freelancerDesc: 'أقدم خدماتي كمستقل'
    },
    en: {
      title: 'Choose Account Type',
      individual: 'Job Seeker',
      individualDesc: 'Looking for job opportunities and training courses',
      company: 'Company',
      companyDesc: 'Looking for employees and offering training courses',
      freelancer: 'Freelancer',
      freelancerDesc: 'Offering my services as a freelancer'
    },
    fr: {
      title: 'Choisir le type de compte',
      individual: 'Chercheur d\'emploi',
      individualDesc: 'À la recherche d\'opportunités d\'emploi et de cours de formation',
      company: 'Entreprise',
      companyDesc: 'À la recherche d\'employés et offrant des cours de formation',
      freelancer: 'Freelance',
      freelancerDesc: 'Offrir mes services en tant que freelance'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  const accountTypes = [
    {
      type: 'individual',
      icon: '👤',
      title: t.individual,
      description: t.individualDesc
    },
    {
      type: 'company',
      icon: '🏢',
      title: t.company,
      description: t.companyDesc
    }
    // يمكن إضافة freelancer لاحقاً
    // {
    //   type: 'freelancer',
    //   icon: '💼',
    //   title: t.freelancer,
    //   description: t.freelancerDesc
    // }
  ];
  
  return (
    <div className="registration-step" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="step-title">{t.title}</h3>
      
      <div className="account-type-grid">
        {accountTypes.map((account) => (
          <div
            key={account.type}
            onClick={() => onUserTypeChange(account.type)}
            className={`account-type-card ${userType === account.type ? 'selected' : ''}`}
          >
            <div className="account-type-icon">{account.icon}</div>
            <h4 className="account-type-title">{account.title}</h4>
            <p className="account-type-description">{account.description}</p>
            
            {/* علامة الاختيار */}
            {userType === account.type && (
              <div className="account-type-check">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step3AccountType;
