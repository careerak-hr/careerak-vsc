import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useBookmarkCount, emitBookmarkCountChange } from '../hooks/useBookmarkCount';
import BookmarkCounter from '../components/Navbar/BookmarkCounter';

/**
 * مثال شامل لاستخدام BookmarkCounter و useBookmarkCount
 * يوضح جميع الحالات والاستخدامات الممكنة
 */
const BookmarkCounterExample = () => {
  const { count, loading, error, fetchCount, incrementCount, decrementCount, setCount } = useBookmarkCount();
  const [mockJobs, setMockJobs] = useState([
    { id: 1, title: 'مطور Full Stack', bookmarked: false },
    { id: 2, title: 'مصمم UI/UX', bookmarked: false },
    { id: 3, title: 'مدير مشروع', bookmarked: false },
    { id: 4, title: 'محلل بيانات', bookmarked: false },
    { id: 5, title: 'مهندس DevOps', bookmarked: false }
  ]);

  const handleToggleBookmark = (jobId) => {
    setMockJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newBookmarked = !job.bookmarked;
        
        // تحديث العداد
        emitBookmarkCountChange(newBookmarked ? 'add' : 'remove');
        
        return { ...job, bookmarked: newBookmarked };
      }
      return job;
    }));
  };

  const handleBookmarkAll = () => {
    setMockJobs(prev => prev.map(job => ({ ...job, bookmarked: true })));
    const unbookmarkedCount = mockJobs.filter(job => !job.bookmarked).length;
    setCount(count + unbookmarkedCount);
  };

  const handleUnbookmarkAll = () => {
    setMockJobs(prev => prev.map(job => ({ ...job, bookmarked: false })));
    setCount(0);
  };

  const handleRefresh = () => {
    fetchCount();
  };

  const handleSetCustomCount = () => {
    const newCount = prompt('أدخل عدد مخصص:', count);
    if (newCount !== null) {
      setCount(parseInt(newCount, 10) || 0);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#304B60' }}>
        BookmarkCounter - أمثلة الاستخدام
      </h1>

      {/* Example 1: BookmarkCounter في Navbar */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          1. BookmarkCounter في Navbar
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: '#E3DAD1',
          borderRadius: '0.5rem'
        }}>
          <span style={{ fontWeight: 'bold' }}>Navbar:</span>
          <BookmarkCounter />
          <span style={{ marginLeft: 'auto', color: '#666' }}>
            العدد الحالي: {count}
          </span>
        </div>
      </section>

      {/* Example 2: Hook Usage */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          2. استخدام useBookmarkCount Hook
        </h2>
        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '0.5rem',
          border: '2px solid #304B60'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>الحالة:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
              <li>Count: {count}</li>
              <li>Loading: {loading ? 'نعم' : 'لا'}</li>
              <li>Error: {error || 'لا يوجد'}</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={incrementCount}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              + زيادة
            </button>
            <button
              onClick={decrementCount}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              - تقليل
            </button>
            <button
              onClick={handleRefresh}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              🔄 تحديث
            </button>
            <button
              onClick={handleSetCustomCount}
              style={{
                padding: '0.5rem 1rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              ⚙️ تعيين مخصص
            </button>
          </div>
        </div>
      </section>

      {/* Example 3: Integration with Job Cards */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          3. التكامل مع بطاقات الوظائف
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {mockJobs.map(job => (
            <div
              key={job.id}
              style={{
                padding: '1rem',
                background: 'white',
                border: '2px solid #E3DAD1',
                borderRadius: '0.5rem',
                position: 'relative'
              }}
            >
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                {job.title}
              </h3>
              <button
                onClick={() => handleToggleBookmark(job.id)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={job.bookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
              >
                <Heart
                  size={20}
                  fill={job.bookmarked ? '#D48161' : 'none'}
                  color={job.bookmarked ? '#D48161' : '#666'}
                />
              </button>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                {job.bookmarked ? '✅ محفوظة' : '⭕ غير محفوظة'}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={handleBookmarkAll}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            حفظ الكل
          </button>
          <button
            onClick={handleUnbookmarkAll}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            إزالة الكل
          </button>
        </div>
      </section>

      {/* Example 4: Event Emitter */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          4. استخدام Event Emitter
        </h2>
        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '0.5rem',
          border: '2px solid #304B60'
        }}>
          <p style={{ marginBottom: '1rem' }}>
            استخدم <code>emitBookmarkCountChange</code> لإطلاق أحداث تحديث العداد:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => emitBookmarkCountChange('add')}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              إطلاق حدث "add"
            </button>
            <button
              onClick={() => emitBookmarkCountChange('remove')}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              إطلاق حدث "remove"
            </button>
            <button
              onClick={() => emitBookmarkCountChange('refresh')}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              إطلاق حدث "refresh"
            </button>
          </div>
        </div>
      </section>

      {/* Example 5: Code Examples */}
      <section>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          5. أمثلة الكود
        </h2>
        <div style={{
          padding: '1.5rem',
          background: '#1e1e1e',
          color: '#d4d4d4',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
          <pre style={{ margin: 0 }}>
{`// في BookmarkButton.jsx
import { emitBookmarkCountChange } from '../../hooks/useBookmarkCount';

const handleToggle = async (jobId) => {
  const result = await toggleBookmark(jobId);
  emitBookmarkCountChange(result.bookmarked ? 'add' : 'remove');
};

// في BookmarkedJobsPage.jsx
import { emitBookmarkCountChange } from '../hooks/useBookmarkCount';

const fetchBookmarkedJobs = async () => {
  const jobs = await fetchJobs();
  localStorage.setItem('bookmarkCount', jobs.length.toString());
  emitBookmarkCountChange('refresh');
};

// في أي مكون آخر
import { useBookmarkCount } from '../hooks/useBookmarkCount';

function MyComponent() {
  const { count, loading } = useBookmarkCount();
  
  return (
    <div>
      {loading ? 'جاري التحميل...' : \`لديك \${count} وظائف محفوظة\`}
    </div>
  );
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default BookmarkCounterExample;
