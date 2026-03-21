import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, Search, Trash2 } from 'lucide-react';
import JobCardGrid from '../components/JobCard/JobCardGrid';
import JobCardList from '../components/JobCard/JobCardList';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import JobCardGridSkeleton from '../components/SkeletonLoaders/JobCardGridSkeleton';
import JobCardListSkeleton from '../components/SkeletonLoaders/JobCardListSkeleton';
import useViewPreference from '../hooks/useViewPreference';
import './39_BookmarkedJobsPage.css';

/**
 * Page to display user's bookmarked jobs
 * Requirements: 2.2, 2.5
 */
const BookmarkedJobsPage = () => {
  const { view, setView } = useViewPreference();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/job-postings/bookmarked');
      setBookmarks(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (jobId) => {
    try {
      await axios.post(`/api/job-postings/${jobId}/bookmark`);
      // Remove from list immediately in this page
      setBookmarks(prev => prev.filter(job => job.id !== jobId && job._id !== jobId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const filteredBookmarks = bookmarks.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bookmarked-jobs-page">
      <header className="page-header">
        <div className="header-title">
          <Bookmark className="header-icon" />
          <h1>الوظائف المحفوظة ({bookmarks.length})</h1>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="بحث في المحفوظات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ViewToggle view={view} onToggle={setView} />
        </div>
      </header>

      {loading ? (
        <div className={`jobs-grid ${view === 'grid' ? 'grid-layout' : 'list-layout'}`}>
          {Array(4).fill(0).map((_, index) => (
            view === 'grid' ? <JobCardGridSkeleton key={index} /> : <JobCardListSkeleton key={index} />
          ))}
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className={`jobs-grid ${view === 'grid' ? 'grid-layout' : 'list-layout'}`}>
          {filteredBookmarks.map(job => (
            view === 'grid' ? (
              <JobCardGrid
                key={job.id || job._id}
                job={job}
                isBookmarked={true}
                onBookmark={handleToggleBookmark}
              />
            ) : (
              <JobCardList
                key={job.id || job._id}
                job={job}
                isBookmarked={true}
                onBookmark={handleToggleBookmark}
              />
            )
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bookmark size={64} className="empty-icon" />
          <p>{searchTerm ? 'لا توجد نتائج تطابق بحثك.' : 'لم تقم بحفظ أي وظائف بعد.'}</p>
          {!searchTerm && <button className="btn-primary" onClick={() => window.location.href='/job-postings'}>تصفح الوظائف</button>}
        </div>
      )}
    </div>
  );
};

export default BookmarkedJobsPage;
