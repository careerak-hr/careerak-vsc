import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/Search/FilterPanel';

/**
 * مثال على استخدام FilterPanel
 * يوضح كيفية دمج لوحة الفلاتر مع صفحة البحث
 */
const FilterPanelExample = () => {
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    salaryMin: undefined,
    salaryMax: undefined,
    workType: [],
    experienceLevel: [],
    skills: [],
    skillsLogic: 'OR',
    datePosted: 'all',
    companySize: [],
    page: 1,
    limit: 20,
    sort: 'relevance'
  });

  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // جلب الفلاتر المتاحة عند التحميل
  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  // جلب النتائج عند تغيير الفلاتر
  useEffect(() => {
    fetchResults();
  }, [filters]);

  /**
   * جلب الفلاتر المتاحة من API
   */
  const fetchAvailableFilters = async () => {
    try {
      const response = await fetch('/api/search/filters/available?type=jobs');
      const data = await response.json();
      
      if (data.success) {
        setAvailableFilters(data.data);
      }
    } catch (error) {
      console.error('Error fetching available filters:', error);
    }
  };

  /**
   * جلب نتائج البحث من API
   */
  const fetchResults = async () => {
    setLoading(true);
    
    try {
      // بناء query string
      const queryParams = new URLSearchParams();
      
      if (filters.query) queryParams.append('q', filters.query);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.salaryMin) queryParams.append('salaryMin', filters.salaryMin);
      if (filters.salaryMax) queryParams.append('salaryMax', filters.salaryMax);
      if (filters.workType.length > 0) queryParams.append('workType', filters.workType.join(','));
      if (filters.experienceLevel.length > 0) queryParams.append('experienceLevel', filters.experienceLevel.join(','));
      if (filters.skills.length > 0) {
        queryParams.append('skills', filters.skills.join(','));
        queryParams.append('skillsLogic', filters.skillsLogic);
      }
      if (filters.datePosted !== 'all') queryParams.append('datePosted', filters.datePosted);
      if (filters.companySize.length > 0) queryParams.append('companySize', filters.companySize.join(','));
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);
      queryParams.append('sort', filters.sort);

      const response = await fetch(`/api/search/jobs?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
        setResultCount(data.data.total);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * معالجة تغيير الفلاتر
   */
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...newFilters,
      page: 1 // إعادة تعيين الصفحة عند تغيير الفلاتر
    });
  };

  /**
   * مسح جميع الفلاتر
   */
  const handleClearFilters = () => {
    setFilters({
      query: '',
      location: '',
      salaryMin: undefined,
      salaryMax: undefined,
      workType: [],
      experienceLevel: [],
      skills: [],
      skillsLogic: 'OR',
      datePosted: 'all',
      companySize: [],
      page: 1,
      limit: 20,
      sort: 'relevance'
    });
  };

  return (
    <div className="search-page">
      <div className="search-container">
        
        {/* Sidebar - Filter Panel */}
        <aside className="filter-sidebar">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={resultCount}
            availableFilters={availableFilters}
            type="jobs"
          />
        </aside>

        {/* Main Content - Results */}
        <main className="results-section">
          <div className="results-header">
            <h2>نتائج البحث</h2>
            <div className="sort-options">
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="date">الأحدث</option>
                <option value="salary">الراتب</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">جاري التحميل...</div>
          ) : results.length === 0 ? (
            <div className="no-results">لا توجد نتائج</div>
          ) : (
            <div className="results-list">
              {results.map(job => (
                <div key={job._id} className="job-card">
                  <h3>{job.title}</h3>
                  <p className="company">{job.company?.name}</p>
                  <p className="location">{job.location?.city}</p>
                  <div className="job-details">
                    <span className="salary">
                      {job.salary ? `${job.salary.min} - ${job.salary.max}` : 'غير محدد'}
                    </span>
                    <span className="job-type">{job.jobType}</span>
                    <span className="experience">{job.experienceLevel}</span>
                  </div>
                  <div className="skills">
                    {job.skills?.slice(0, 5).map(skill => (
                      <span key={skill} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {resultCount > filters.limit && (
            <div className="pagination">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                السابق
              </button>
              <span>صفحة {filters.page} من {Math.ceil(resultCount / filters.limit)}</span>
              <button
                disabled={filters.page >= Math.ceil(resultCount / filters.limit)}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                التالي
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default FilterPanelExample;

/**
 * مثال على CSS للصفحة (يمكن وضعه في ملف منفصل)
 */
const styles = `
.search-page {
  min-height: 100vh;
  background: #E3DAD1;
  padding: 20px;
}

.search-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
}

.filter-sidebar {
  /* FilterPanel styles are in FilterPanel.css */
}

.results-section {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  min-height: 600px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #D4816180;
}

.results-header h2 {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1.8rem;
  color: #304B60;
  margin: 0;
}

.sort-options select {
  padding: 8px 12px;
  border: 2px solid #D4816180;
  border-radius: 6px;
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 0.95rem;
  background: #fff;
  color: #304B60;
  cursor: pointer;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1.2rem;
  color: #999;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-card {
  background: #E3DAD1;
  border: 2px solid #D4816180;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.job-card:hover {
  border-color: #D48161;
  box-shadow: 0 4px 12px rgba(212, 129, 97, 0.2);
}

.job-card h3 {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1.3rem;
  color: #304B60;
  margin: 0 0 10px 0;
}

.job-card .company {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1rem;
  color: #D48161;
  margin: 0 0 5px 0;
}

.job-card .location {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 15px 0;
}

.job-details {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.job-details span {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(48, 75, 96, 0.1);
  color: #304B60;
}

.skills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.skill-badge {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  background: #304B60;
  color: #E3DAD1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #D4816180;
}

.pagination button {
  padding: 10px 20px;
  border: 2px solid #D48161;
  border-radius: 8px;
  background: transparent;
  color: #D48161;
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: #D48161;
  color: #E3DAD1;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-family: 'Amiri', 'Cairo', serif;
  font-size: 1rem;
  color: #304B60;
}

@media (max-width: 1024px) {
  .search-container {
    grid-template-columns: 1fr;
  }
}
`;
