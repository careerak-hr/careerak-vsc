/**
 * SearchPage Usage Example
 * 
 * هذا المثال يوضح كيفية استخدام صفحة البحث مع ميزة التبديل بين عرض القائمة والخريطة
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SearchPage from '../pages/SearchPage';

const SearchPageExample = () => {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Amiri, Cairo, serif' }}>
        <nav style={{ 
          padding: '20px', 
          backgroundColor: '#304B60', 
          color: 'white',
          marginBottom: '20px'
        }}>
          <h1>مثال على صفحة البحث</h1>
          <div style={{ marginTop: '10px' }}>
            <Link 
              to="/search" 
              style={{ 
                color: 'white', 
                marginRight: '15px',
                textDecoration: 'none'
              }}
            >
              البحث (عرض افتراضي)
            </Link>
            <Link 
              to="/search?view=list" 
              style={{ 
                color: 'white', 
                marginRight: '15px',
                textDecoration: 'none'
              }}
            >
              البحث (عرض قائمة)
            </Link>
            <Link 
              to="/search?view=map" 
              style={{ 
                color: 'white',
                textDecoration: 'none'
              }}
            >
              البحث (عرض خريطة)
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>

        {/* Instructions */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#E3DAD1',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#304B60' }}>كيفية الاستخدام:</h2>
          <ol style={{ color: '#304B60', lineHeight: '1.8' }}>
            <li>انقر على أحد الروابط أعلاه للانتقال إلى صفحة البحث</li>
            <li>استخدم أزرار التبديل في أعلى الصفحة للتبديل بين عرض القائمة والخريطة</li>
            <li>لاحظ أن وضع العرض يُحفظ في URL (يمكن مشاركته)</li>
            <li>التصميم متجاوب ويعمل على جميع الأجهزة</li>
          </ol>

          <h3 style={{ color: '#304B60', marginTop: '20px' }}>الميزات المنفذة:</h3>
          <ul style={{ color: '#304B60', lineHeight: '1.8' }}>
            <li>✅ زر تبديل بين عرض القائمة والخريطة</li>
            <li>✅ حفظ وضع العرض في URL</li>
            <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
            <li>✅ دعم RTL/LTR</li>
            <li>✅ أيقونات واضحة لكل وضع عرض</li>
            <li>✅ تأثيرات انتقالية سلسة</li>
            <li>✅ ألوان من palette المشروع</li>
            <li>✅ خطوط Amiri للعربية</li>
          </ul>

          <h3 style={{ color: '#304B60', marginTop: '20px' }}>المكونات المطلوبة (للتكامل):</h3>
          <ul style={{ color: '#666', lineHeight: '1.8' }}>
            <li>SearchBar - شريط البحث مع autocomplete</li>
            <li>FilterPanel - لوحة الفلاتر الجانبية</li>
            <li>ResultsList - عرض النتائج في قائمة</li>
            <li>MapView - عرض النتائج على خريطة تفاعلية</li>
          </ul>

          <h3 style={{ color: '#304B60', marginTop: '20px' }}>API Integration:</h3>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
{`// مثال على دمج API
const handleSearch = async (query, filters) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      q: query,
      ...filters,
      view: viewMode
    });
    
    const response = await fetch(\`/api/search/jobs?\${params}\`);
    const data = await response.json();
    
    setResults(data.results);
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setLoading(false);
  }
};`}
          </pre>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default SearchPageExample;
