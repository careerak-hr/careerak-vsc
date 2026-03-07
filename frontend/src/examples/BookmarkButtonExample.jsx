import React, { useState } from 'react';
import BookmarkButton from '../components/JobCard/BookmarkButton';
import '../components/JobCard/BookmarkButton.css';

/**
 * مثال استخدام BookmarkButton
 * يوضح جميع الخيارات والحالات المختلفة
 */
const BookmarkButtonExample = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set(['job-1', 'job-3']));

  // دالة تبديل حالة الحفظ
  const handleToggleBookmark = async (jobId) => {
    // محاكاة API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        console.log(`✅ تم إزالة الوظيفة ${jobId} من المفضلة`);
      } else {
        newSet.add(jobId);
        console.log(`❤️ تم حفظ الوظيفة ${jobId} في المفضلة`);
      }
      return newSet;
    });
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '40px', color: '#304B60' }}>
        أمثلة BookmarkButton
      </h1>

      {/* مثال 1: الأحجام المختلفة */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', color: '#304B60' }}>
          1. الأحجام المختلفة
        </h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Small</p>
            <BookmarkButton
              jobId="job-size-small"
              isBookmarked={bookmarkedJobs.has('job-size-small')}
              onToggle={handleToggleBookmark}
              size="small"
            />
          </div>

          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Medium (افتراضي)</p>
            <BookmarkButton
              jobId="job-size-medium"
              isBookmarked={bookmarkedJobs.has('job-size-medium')}
              onToggle={handleToggleBookmark}
              size="medium"
            />
          </div>

          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Large</p>
            <BookmarkButton
              jobId="job-size-large"
              isBookmarked={bookmarkedJobs.has('job-size-large')}
              onToggle={handleToggleBookmark}
              size="large"
            />
          </div>
        </div>
      </section>

      {/* مثال 2: الأنواع المختلفة */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', color: '#304B60' }}>
          2. الأنواع المختلفة
        </h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Icon Only (افتراضي)</p>
            <BookmarkButton
              jobId="job-variant-icon"
              isBookmarked={bookmarkedJobs.has('job-variant-icon')}
              onToggle={handleToggleBookmark}
              variant="icon"
            />
          </div>

          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Button with Label</p>
            <BookmarkButton
              jobId="job-variant-button"
              isBookmarked={bookmarkedJobs.has('job-variant-button')}
              onToggle={handleToggleBookmark}
              variant="button"
              showLabel={true}
            />
          </div>
        </div>
      </section>

      {/* مثال 3: الحالات المختلفة */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', color: '#304B60' }}>
          3. الحالات المختلفة
        </h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>غير محفوظة</p>
            <BookmarkButton
              jobId="job-state-not-bookmarked"
              isBookmarked={false}
              onToggle={handleToggleBookmark}
            />
          </div>

          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>محفوظة</p>
            <BookmarkButton
              jobId="job-state-bookmarked"
              isBookmarked={true}
              onToggle={handleToggleBookmark}
            />
          </div>

          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>معطلة</p>
            <BookmarkButton
              jobId="job-state-disabled"
              isBookmarked={false}
              onToggle={handleToggleBookmark}
              disabled={true}
            />
          </div>
        </div>
      </section>

      {/* مثال 4: في بطاقة وظيفة */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', color: '#304B60' }}>
          4. في بطاقة وظيفة
        </h2>
        <div style={{
          backgroundColor: '#E3DAD1',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#304B60' }}>مطور Full Stack</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>شركة التقنية المتقدمة</p>
            </div>
            <BookmarkButton
              jobId="job-1"
              isBookmarked={bookmarkedJobs.has('job-1')}
              onToggle={handleToggleBookmark}
            />
          </div>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
            نبحث عن مطور Full Stack ذو خبرة في React و Node.js للانضمام إلى فريقنا المتنامي.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(48, 75, 96, 0.1)', borderRadius: '16px', fontSize: '12px' }}>
              React
            </span>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(48, 75, 96, 0.1)', borderRadius: '16px', fontSize: '12px' }}>
              Node.js
            </span>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(48, 75, 96, 0.1)', borderRadius: '16px', fontSize: '12px' }}>
              MongoDB
            </span>
          </div>
        </div>
      </section>

      {/* مثال 5: قائمة وظائف */}
      <section>
        <h2 style={{ marginBottom: '20px', color: '#304B60' }}>
          5. قائمة وظائف
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'job-1', title: 'مطور Frontend', company: 'شركة أ', bookmarked: true },
            { id: 'job-2', title: 'مطور Backend', company: 'شركة ب', bookmarked: false },
            { id: 'job-3', title: 'مصمم UI/UX', company: 'شركة ج', bookmarked: true },
            { id: 'job-4', title: 'مدير مشروع', company: 'شركة د', bookmarked: false }
          ].map(job => (
            <div
              key={job.id}
              style={{
                backgroundColor: '#E3DAD1',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#304B60' }}>{job.title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{job.company}</p>
              </div>
              <BookmarkButton
                jobId={job.id}
                isBookmarked={bookmarkedJobs.has(job.id)}
                onToggle={handleToggleBookmark}
              />
            </div>
          ))}
        </div>
      </section>

      {/* معلومات الحالة */}
      <section style={{ marginTop: '60px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '16px', color: '#304B60' }}>الوظائف المحفوظة:</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {bookmarkedJobs.size === 0 ? (
            'لا توجد وظائف محفوظة'
          ) : (
            `عدد الوظائف المحفوظة: ${bookmarkedJobs.size} - ${Array.from(bookmarkedJobs).join(', ')}`
          )}
        </p>
      </section>
    </div>
  );
};

export default BookmarkButtonExample;
