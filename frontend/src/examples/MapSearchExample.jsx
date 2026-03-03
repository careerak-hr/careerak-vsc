import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, Rectangle, InfoWindow } from '@react-google-maps/api';

/**
 * مثال على استخدام البحث الجغرافي على الخريطة
 * يدعم نوعين من البحث:
 * 1. البحث في مستطيل (Box Search)
 * 2. البحث في دائرة (Circle Search)
 */

const MapSearchExample = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchType, setSearchType] = useState('box'); // 'box' or 'circle'
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // للبحث في مستطيل
  const [bounds, setBounds] = useState({
    north: 30.1,
    south: 30.0,
    east: 31.3,
    west: 31.2
  });

  // للبحث في دائرة
  const [circle, setCircle] = useState({
    lat: 30.0444,
    lng: 31.2357,
    radius: 50 // بالكيلومتر
  });

  // مركز الخريطة الافتراضي (القاهرة)
  const [center, setCenter] = useState({
    lat: 30.0444,
    lng: 31.2357
  });

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  /**
   * البحث في مستطيل
   */
  const searchInBox = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west
      });

      const response = await fetch(`/api/search/map?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMarkers(data.data.markers);
      } else {
        console.error('Search failed:', data.error);
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error searching in box:', error);
      alert('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  /**
   * البحث في دائرة
   */
  const searchInCircle = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        type: 'circle',
        lat: circle.lat,
        lng: circle.lng,
        radius: circle.radius
      });

      const response = await fetch(`/api/search/map?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMarkers(data.data.markers);
      } else {
        console.error('Search failed:', data.error);
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error searching in circle:', error);
      alert('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  /**
   * البحث بناءً على حدود الخريطة الحالية
   */
  const searchCurrentBounds = () => {
    if (!map) return;

    const mapBounds = map.getBounds();
    const ne = mapBounds.getNorthEast();
    const sw = mapBounds.getSouthWest();

    setBounds({
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng()
    });

    // تنفيذ البحث تلقائياً
    setTimeout(() => {
      searchInBox();
    }, 100);
  };

  /**
   * رسم دائرة على الخريطة
   */
  const drawCircle = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setCircle({
      ...circle,
      lat,
      lng
    });

    setCenter({ lat, lng });
  };

  /**
   * رسم مستطيل على الخريطة
   */
  const drawRectangle = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // تحديث الحدود بناءً على النقرة
    const latDiff = 0.05;
    const lngDiff = 0.05;

    setBounds({
      north: lat + latDiff,
      south: lat - latDiff,
      east: lng + lngDiff,
      west: lng - lngDiff
    });

    setCenter({ lat, lng });
  };

  return (
    <div className="map-search-container" style={{ padding: '20px' }}>
      <h1>البحث الجغرافي على الخريطة</h1>

      {/* أدوات التحكم */}
      <div className="controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* اختيار نوع البحث */}
        <div>
          <label>نوع البحث: </label>
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            style={{ padding: '5px 10px' }}
          >
            <option value="box">مستطيل (Box)</option>
            <option value="circle">دائرة (Circle)</option>
          </select>
        </div>

        {/* أدوات البحث في مستطيل */}
        {searchType === 'box' && (
          <>
            <button 
              onClick={searchInBox}
              disabled={loading}
              style={{ padding: '5px 15px', cursor: 'pointer' }}
            >
              {loading ? 'جاري البحث...' : 'بحث في المستطيل'}
            </button>
            <button 
              onClick={searchCurrentBounds}
              disabled={loading}
              style={{ padding: '5px 15px', cursor: 'pointer' }}
            >
              بحث في الحدود الحالية
            </button>
            <div style={{ fontSize: '12px', color: '#666' }}>
              انقر على الخريطة لرسم مستطيل
            </div>
          </>
        )}

        {/* أدوات البحث في دائرة */}
        {searchType === 'circle' && (
          <>
            <div>
              <label>نصف القطر (كم): </label>
              <input 
                type="number" 
                value={circle.radius}
                onChange={(e) => setCircle({ ...circle, radius: parseFloat(e.target.value) })}
                min="1"
                max="500"
                style={{ padding: '5px', width: '80px' }}
              />
            </div>
            <button 
              onClick={searchInCircle}
              disabled={loading}
              style={{ padding: '5px 15px', cursor: 'pointer' }}
            >
              {loading ? 'جاري البحث...' : 'بحث في الدائرة'}
            </button>
            <div style={{ fontSize: '12px', color: '#666' }}>
              انقر على الخريطة لتحديد مركز الدائرة
            </div>
          </>
        )}

        {/* عدد النتائج */}
        <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
          النتائج: {markers.length}
        </div>
      </div>

      {/* الخريطة */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          onLoad={setMap}
          onClick={searchType === 'circle' ? drawCircle : drawRectangle}
        >
          {/* رسم الدائرة */}
          {searchType === 'circle' && (
            <Circle
              center={{ lat: circle.lat, lng: circle.lng }}
              radius={circle.radius * 1000} // تحويل من كم إلى متر
              options={{
                fillColor: '#304B60',
                fillOpacity: 0.2,
                strokeColor: '#304B60',
                strokeOpacity: 0.8,
                strokeWeight: 2
              }}
            />
          )}

          {/* رسم المستطيل */}
          {searchType === 'box' && (
            <Rectangle
              bounds={{
                north: bounds.north,
                south: bounds.south,
                east: bounds.east,
                west: bounds.west
              }}
              options={{
                fillColor: '#D48161',
                fillOpacity: 0.2,
                strokeColor: '#D48161',
                strokeOpacity: 0.8,
                strokeWeight: 2
              }}
            />
          )}

          {/* علامات الوظائف */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker)}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          ))}

          {/* نافذة المعلومات */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  {selectedMarker.title}
                </h3>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>الشركة:</strong> {selectedMarker.company}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>الموقع:</strong> {selectedMarker.location}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>الراتب:</strong> {selectedMarker.salary}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>نوع العمل:</strong> {selectedMarker.jobType}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>مستوى الخبرة:</strong> {selectedMarker.experienceLevel}
                </p>
                <button
                  onClick={() => window.location.href = `/jobs/${selectedMarker.id}`}
                  style={{
                    marginTop: '10px',
                    padding: '5px 15px',
                    backgroundColor: '#304B60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  عرض التفاصيل
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* قائمة النتائج */}
      <div className="results-list" style={{ marginTop: '20px' }}>
        <h2>النتائج ({markers.length})</h2>
        {markers.length === 0 ? (
          <p style={{ color: '#666' }}>لا توجد وظائف في المنطقة المحددة</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {markers.map((marker) => (
              <div 
                key={marker.id}
                style={{
                  border: '2px solid #D4816180',
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => {
                  setSelectedMarker(marker);
                  setCenter(marker.position);
                  map?.panTo(marker.position);
                  map?.setZoom(12);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D48161';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D4816180';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#304B60' }}>
                  {marker.title}
                </h3>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  🏢 {marker.company}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  📍 {marker.location}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  💰 {marker.salary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearchExample;
