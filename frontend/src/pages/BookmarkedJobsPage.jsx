import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import { Heart, Search, Filter, X, Trash2, RefreshCw } from 'lucide-react';
import JobCardGrid from '../components/JobCard/JobCardGrid';
import JobCardList from '../components/JobCard/JobCardList';
import { useViewPreference } from '../hooks/useViewPreference';
import { emitBookmarkCountChange } from '../hooks/useBookmarkCount';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import { JobCardSkeleton } from '../components/SkeletonLoaders';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import { getBookmarkedJobs, toggleBookmark, syncBookmarks, setupOnlineListener, isOnline } from '../utils/bookmarkUtils';
import './BookmarkedJobsPage.css';

/**
 * صفحة الوظائف المحفوظة
 * تعرض جميع الوظائف التي حفظها المستخدم مع إمكانية البحث والفلترة
 */
const BookmarkedJobsPage = () => {
  const { language, startBgMusic } = useApp();
  const seo = useSEO('bookmarkedJobs', {});
  const { shouldAnimate } = useAnimation();
  const [view, toggleView] = useViewPreference();
  
  // States
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    type: '',
    salary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [online, setOnline] = useState(isOnline());

  // Fetch bookmarked jobs
  useEffect(() => {
    startBgMusic();
    fetchBookmarkedJobs();
    
    // إعداد مستمع للاتصال بالإنترنت
    const removeListener = setupOnlineListener(handleSync);
    
    // مستمع لحالة الاتصال
    const handleOnlineStatus = () => setOnline(true);
    const handleOfflineStatus = () => setOnline(false);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    return () => {
      removeListener();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, [startBgMusic]);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [bookmarkedJobs, searchQuery, selectedFilters]);

  const fetchBookmarkedJobs = async () => {
    setLoading(true);
    try {
      const jobs = await getBookmarkedJobs();
      setBookmarkedJobs(jobs);
      
      // تحديث العداد
      emitBookmarkCountChange('refresh');
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (result) => {
    if (result?.success) {
      await fetchBookmarkedJobs();
    }
  };

  const handleManualSync = async () => {
    if (!online) {
      alert('لا يوجد اتصال بالإنترنت');
      return;
    }
    
    setSyncing(true);
    try {
      const result = await syncBookmarks();
      if (result.success) {
        await fetchBookmarkedJobs();
        alert(`تمت المزامنة بنجاح! (${result.count} وظيفة)`);
      } else {
        alert('فشلت المزامنة. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('حدث خطأ أثناء المزامنة');
    } finally {
      setSyncing(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...bookmarkedJobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.requiredSkills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (selectedFilters.location) {
      filtered = filtered.filter(job => 
        job.location?.city === selectedFilters.location
      );
    }

    // Type filter
    if (selectedFilters.type) {
      filtered = filtered.filter(job => 
        job.type === selectedFilters.type
      );
    }

    // Salary filter
    if (selectedFilters.salary) {
      const [min, max] = selectedFilters.salary.split('-').map(Number);
      filtered = filtered.filter(job => {
        if (!job.salary) return false;
        if (max) {
          return job.salary >= min && job.salary <= max;
        }
        return job.salary >= min;
      });
    }

    setFilteredJobs(filtered);
  };

  const handleRemoveBookmark = async (jobId) => {
    try {
      const result = await toggleBookmark(jobId);
      
      if (result.bookmarked === false) {
        setBookmarkedJobs(prev => {
          const newJobs = prev.filter(job => (job._id || job.id) !== jobId);
          return newJobs;
        });
        
        // تحديث العداد
        emitBookmarkCountChange('remove');
      }
      
      if (result.offline) {
        alert('تم الحفظ محلياً. سيتم المزامنة عند الاتصال بالإنترنت.');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('حدث خطأ أثناء إزالة الوظيفة من المفضلة');
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedFilters({
      location: '',
      type: '',
      salary: ''
    });
  };

  const handleClearAllBookmarks = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع الوظائف المحفوظة؟')) {
      return;
    }

    try {
      // TODO: استبدال بـ API call حقيقي
      // await fetch('/api/jobs/bookmarked/clear', {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      setBookmarkedJobs([]);
      
      // تحديث العداد في localStorage
      localStorage.setItem('bookmarkCount', '0');
      
      // إطلاق حدث لتحديث العداد في Navbar
      emitBookmarkCountChange('refresh');
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };

  // Get unique values for filters
  const uniqueLocations = [...new Set(bookmarkedJobs.map(job => job.location?.city).filter(Boolean))];
  const uniqueTypes = [...new Set(bookmarkedJobs.map(job => job.type).filter(Boolean))];

  // Animation variants
  const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
  const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

  // Empty state
  const EmptyState = () => (
    <div className="bookmarked-empty-state">
      <Heart size={64} className="empty-icon" />
      <h2>لا توجد وظائف محفوظة</h2>
      <p>ابدأ بحفظ الوظائف التي تهمك لتجدها هنا</p>
      <a href="/job-postings" className="btn-primary">
        تصفح الوظائف
      </a>
    </div>
  );

  // No results state
  const NoResultsState = () => (
    <div className="bookmarked-no-results">
      <Search size={48} className="no-results-icon" />
      <h3>لا توجد نتائج</h3>
      <p>جرب تغيير معايير البحث أو الفلاتر</p>
      <button onClick={handleClearAllFilters} className="btn-secondary">
        مسح الفلاتر
      </button>
    </div>
  );

  if (loading) {
    return (
      <>
        <SEOHead {...seo} />
        <main id="main-content" tabIndex="-1" className="bookmarked-jobs-page">
          <div className="container">
            <div className="page-header">
              <h1>الوظائف المحفوظة</h1>
            </div>
            <JobCardSkeleton count={3} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1" className="bookmarked-jobs-page">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <Heart size={32} className="page-icon" />
              <div>
                <h1>الوظائف المحفوظة</h1>
                <p className="page-subtitle">
                  {bookmarkedJobs.length} {bookmarkedJobs.length === 1 ? 'وظيفة' : 'وظائف'} محفوظة
                  {!online && <span className="offline-badge"> (غير متصل)</span>}
                </p>
              </div>
            </div>

            <div className="page-actions">
              {/* زر المزامنة */}
              <button
                onClick={handleManualSync}
                className="btn-secondary"
                disabled={!online || syncing}
                aria-label="مزامنة الوظائف المحفوظة"
                title="مزامنة مع الخادم"
              >
                <RefreshCw size={18} className={syncing ? 'spinning' : ''} />
                <span>{syncing ? 'جاري المزامنة...' : 'مزامنة'}</span>
              </button>

              {bookmarkedJobs.length > 0 && (
                <button
                  onClick={handleClearAllBookmarks}
                  className="btn-danger-outline"
                  aria-label="حذف جميع الوظائف المحفوظة"
                >
                  <Trash2 size={18} />
                  <span>حذف الكل</span>
                </button>
              )}
            </div>
          </div>

          {bookmarkedJobs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Search and Filters Bar */}
              <div className="search-filter-bar">
                {/* Search Input */}
                <div className="search-input-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="ابحث في الوظائف المحفوظة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    aria-label="البحث في الوظائف المحفوظة"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="clear-search-btn"
                      aria-label="مسح البحث"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                  aria-label="عرض الفلاتر"
                  aria-expanded={showFilters}
                >
                  <Filter size={20} />
                  <span>فلاتر</span>
                </button>

                {/* View Toggle */}
                <ViewToggle view={view} onToggle={toggleView} />
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <motion.div
                  className="filters-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="filters-grid">
                    {/* Location Filter */}
                    <div className="filter-group">
                      <label htmlFor="location-filter">الموقع</label>
                      <select
                        id="location-filter"
                        value={selectedFilters.location}
                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="filter-select"
                      >
                        <option value="">جميع المواقع</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div className="filter-group">
                      <label htmlFor="type-filter">نوع العمل</label>
                      <select
                        id="type-filter"
                        value={selectedFilters.type}
                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="filter-select"
                      >
                        <option value="">جميع الأنواع</option>
                        {uniqueTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Salary Filter */}
                    <div className="filter-group">
                      <label htmlFor="salary-filter">الراتب</label>
                      <select
                        id="salary-filter"
                        value={selectedFilters.salary}
                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, salary: e.target.value }))}
                        className="filter-select"
                      >
                        <option value="">جميع الرواتب</option>
                        <option value="0-10000">أقل من 10,000</option>
                        <option value="10000-15000">10,000 - 15,000</option>
                        <option value="15000-20000">15,000 - 20,000</option>
                        <option value="20000">أكثر من 20,000</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(selectedFilters.location || selectedFilters.type || selectedFilters.salary) && (
                    <button
                      onClick={handleClearAllFilters}
                      className="btn-clear-filters"
                    >
                      <X size={18} />
                      <span>مسح الفلاتر</span>
                    </button>
                  )}
                </motion.div>
              )}

              {/* Results Count */}
              <div className="results-info">
                <p>
                  عرض {filteredJobs.length} من {bookmarkedJobs.length} {filteredJobs.length === 1 ? 'وظيفة' : 'وظائف'}
                </p>
              </div>

              {/* Jobs List */}
              {filteredJobs.length === 0 ? (
                <NoResultsState />
              ) : (
                <motion.div
                  className={`jobs-container ${view === 'grid' ? 'jobs-grid' : 'jobs-list'}`}
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {filteredJobs.map((job) => (
                    <motion.div key={job.id} variants={itemVariants}>
                      {view === 'grid' ? (
                        <JobCardGrid
                          job={job}
                          isBookmarked={true}
                          onBookmark={handleRemoveBookmark}
                          onClick={() => window.location.href = `/jobs/${job.id}`}
                        />
                      ) : (
                        <JobCardList
                          job={job}
                          isBookmarked={true}
                          onBookmark={handleRemoveBookmark}
                          onClick={() => window.location.href = `/jobs/${job.id}`}
                        />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default BookmarkedJobsPage;
