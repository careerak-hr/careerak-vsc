import React, { useState } from 'react';
import ShareButton from './ShareButton';
import ShareModal from './ShareModal';

/**
 * أمثلة استخدام ShareButton و ShareModal
 */

// بيانات وظيفة تجريبية
const sampleJob = {
  id: '123',
  title: 'مطور Full Stack',
  company: {
    name: 'شركة التقنية المتقدمة',
    logo: 'https://via.placeholder.com/100'
  },
  location: {
    city: 'الرياض'
  },
  description: 'نبحث عن مطور Full Stack ذو خبرة للانضمام إلى فريقنا المتنامي...',
  salary: 15000,
  type: 'دوام كامل',
  requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
  createdAt: new Date().toISOString(),
  isNew: true
};

/**
 * مثال 1: زر بسيط (icon فقط)
 */
export const SimpleShareButton = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 1: زر بسيط (icon فقط)</h3>
      <ShareButton 
        job={sampleJob}
        onShare={handleShare}
      />
    </div>
  );
};

/**
 * مثال 2: زر مع نص
 */
export const ShareButtonWithText = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 2: زر مع نص</h3>
      <ShareButton 
        job={sampleJob}
        variant="both"
        size="large"
        onShare={handleShare}
      />
    </div>
  );
};

/**
 * مثال 3: أحجام مختلفة
 */
export const DifferentSizes = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 3: أحجام مختلفة</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ShareButton 
          job={sampleJob}
          size="small"
          onShare={handleShare}
        />
        <ShareButton 
          job={sampleJob}
          size="medium"
          onShare={handleShare}
        />
        <ShareButton 
          job={sampleJob}
          size="large"
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

/**
 * مثال 4: أنواع مختلفة
 */
export const DifferentVariants = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 4: أنواع مختلفة</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <ShareButton 
          job={sampleJob}
          variant="icon"
          onShare={handleShare}
        />
        <ShareButton 
          job={sampleJob}
          variant="text"
          onShare={handleShare}
        />
        <ShareButton 
          job={sampleJob}
          variant="both"
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

/**
 * مثال 5: Modal مباشر
 */
export const DirectModal = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
    setShowModal(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 5: Modal مباشر</h3>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#304B60',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}
      >
        فتح Modal
      </button>

      {showModal && (
        <ShareModal
          job={sampleJob}
          onShare={handleShare}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

/**
 * مثال 6: في بطاقة وظيفة
 */
export const InJobCard = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
    alert(`تمت المشاركة على ${platform}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 6: في بطاقة وظيفة</h3>
      <div style={{
        border: '2px solid #D4816180',
        borderRadius: '1rem',
        padding: '1.5rem',
        maxWidth: '400px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <img 
            src={sampleJob.company.logo} 
            alt={sampleJob.company.name}
            style={{ width: '60px', height: '60px', borderRadius: '0.5rem' }}
          />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#304B60' }}>
              {sampleJob.title}
            </h4>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>
              {sampleJob.company.name}
            </p>
          </div>
        </div>

        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {sampleJob.description}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {sampleJob.requiredSkills.map((skill, index) => (
            <span 
              key={index}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#F3F4F6',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                color: '#6B7280'
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#304B60',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            تقديم
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#6B7280'
            }}>
              ♥
            </button>
            <ShareButton 
              job={sampleJob}
              size="medium"
              variant="icon"
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * مثال 7: مع تتبع Google Analytics
 */
export const WithAnalytics = () => {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
    
    // تتبع في Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'job',
        item_id: sampleJob.id
      });
    }
    
    alert(`تمت المشاركة على ${platform} وتم تسجيلها في Analytics`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>مثال 7: مع تتبع Google Analytics</h3>
      <ShareButton 
        job={sampleJob}
        variant="both"
        onShare={handleShare}
      />
    </div>
  );
};

/**
 * مثال 8: جميع الأمثلة معاً
 */
const ShareButtonExamples = () => {
  return (
    <div style={{ 
      fontFamily: 'Amiri, serif',
      direction: 'rtl',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#304B60',
        marginBottom: '2rem'
      }}>
        أمثلة ShareButton و ShareModal
      </h1>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <SimpleShareButton />
        <ShareButtonWithText />
        <DifferentSizes />
        <DifferentVariants />
        <DirectModal />
        <InJobCard />
        <WithAnalytics />
      </div>
    </div>
  );
};

export default ShareButtonExamples;
