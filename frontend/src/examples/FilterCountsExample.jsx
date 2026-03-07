import React, { useState, useEffect } from 'react';
import { FilterPanel } from '../components/Search';
import './FilterCountsExample.css';

/**
 * مثال بسيط لاستخدام عداد النتائج لكل فلتر
 * @component
 */
const FilterCountsExample = () => {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [filterCounts, setFilterCounts] = useState({});
  const [loading, setLoading] = useState(false);

  // Available filters (يمكن جلبها من API)
  const availableFilters = {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java']
  };

  // جلب النتائج عند تغيير الفلاتر
  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // بناء query parameters
      const params = new URLSearchParams();
      params.append('q', 'developer');
      
      if (filters.workType && filters.workType.length > 0) {
        params.append('workType', filters.workType.join(','));
      }
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        params.append('experienceLevel', filters.experienceLevel.join(','));
      }
      if (filters.salaryMin) {
        params.append('salaryMin', filters.salaryMin);
      }
      if (filters.salaryMax) {
        params.append('salaryMax', filters.salaryMax);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/jobs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // ✅ استخراج النتائج والعدادات
      setResults(data.data?.results || []);
      setResultCount(data.data?.total || 0);
      setFilterCounts(data.data?.filters?.counts || {}); // ✅ هنا العدادات
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setResultCount(0);
      setFilterCounts({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="filter-counts-example">
      <h1>مثال: عداد النتائج لكل فلتر</h1>
      
      <div className="example-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={resultCount}
            filterCounts={filterCounts}  // ✅ تمرير العدادات
            availableFilters={availableFilters}
            type="jobs"
          />
        </aside>

        {/* Results */}
        <main className="results-main">
          <h2>النتائج ({resultCount})</h2>
          
          {loading ? (
            <div className="loading">جاري التحميل...</div>
          ) : results.length > 0 ? (
            <div className="results-list">
              {results.map((job, index) => (
                <div key={index} className="job-card">
                  <h3>{job.title}</h3>
                  <p>{job.company?.name}</p>
                  <p>{job.location?.city}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">لا توجد نتائج</div>
          )}

          {/* عرض العدادات للتوضيح */}
          <div className="counts-display">
            <h3>العدادات (للتوضيح)</h3>
            <pre>{JSON.stringify(filterCounts, null, 2)}</pre>
          </div>
        </main>
      </div>

      {/* شرح الميزة */}
      <div className="feature-explanation">
        <h2>كيف تعمل الميزة؟</h2>
        <ol>
          <li>عند جلب النتائج، يتم حساب عدد النتائج لكل خيار فلتر</li>
          <li>العدادات تُعرض بجانب كل خيار (مثل: دوام كامل (150))</li>
          <li>المستخدم يرى عدد النتائج قبل تطبيق الفلتر</li>
          <li>العدادات تتحدث تلقائياً مع كل تغيير في الفلاتر</li>
        </ol>

        <h3>مثال على البيانات المستلمة:</h3>
        <pre>{`{
  "data": {
    "results": [...],
    "total": 150,
    "filters": {
      "counts": {
        "total": 500,
        "withFilters": 150,
        "workType": {
          "Full-time": 150,
          "Part-time": 80,
          "Remote": 120
        },
        "experienceLevel": {
          "Entry": 100,
          "Mid": 150,
          "Senior": 180
        }
      }
    }
  }
}`}</pre>

        <h3>الفوائد:</h3>
        <ul>
          <li>✅ تجربة مستخدم أفضل</li>
          <li>✅ شفافية كاملة</li>
          <li>✅ كفاءة عالية</li>
          <li>✅ دقة تلقائية</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterCountsExample;
