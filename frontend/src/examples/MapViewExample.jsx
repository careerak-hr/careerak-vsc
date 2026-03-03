import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView/MapView';

/**
 * MapViewExample - مثال استخدام MapView Component
 * 
 * يوضح كيفية:
 * - عرض الوظائف على الخريطة
 * - Clustering تلقائي للعلامات
 * - التفاعل مع العلامات
 * - البحث الجغرافي
 */
const MapViewExample = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState(null);

  // جلب الوظائف من API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/search/jobs?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data.results);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // البحث بناءً على حدود الخريطة
  const handleBoundsChange = async (newBounds) => {
    setBounds(newBounds);
    
    try {
      const response = await fetch('/api/search/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bounds: newBounds })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data.results);
      }
    } catch (error) {
      console.error('Error searching by bounds:', error);
    }
  };

  // عند النقر على وظيفة
  const handleJobClick = (job) => {
    console.log('Job clicked:', job);
    // يمكن فتح modal أو الانتقال لصفحة التفاصيل
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="map-view-example">
      <h1>عرض الوظائف على الخريطة</h1>
      
      <div className="map-info">
        <p>عدد الوظائف: {jobs.length}</p>
        {bounds && (
          <p>
            الحدود: {bounds.north.toFixed(2)}, {bounds.south.toFixed(2)}, 
            {bounds.east.toFixed(2)}, {bounds.west.toFixed(2)}
          </p>
        )}
      </div>

      <MapView
        jobs={jobs}
        onJobClick={handleJobClick}
        onBoundsChange={handleBoundsChange}
        center={{ lat: 24.7136, lng: 46.6753 }}
        zoom={6}
      />

      <div className="map-instructions">
        <h3>التعليمات:</h3>
        <ul>
          <li>استخدم الماوس للتكبير والتصغير</li>
          <li>اسحب الخريطة للتنقل</li>
          <li>انقر على العلامات لعرض التفاصيل</li>
          <li>العلامات تتجمع تلقائياً عند التصغير (clustering)</li>
          <li>انقر على cluster لتكبير المنطقة</li>
        </ul>
      </div>
    </div>
  );
};

export default MapViewExample;
