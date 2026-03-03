import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerClusterer } from '@react-google-maps/api';
import { useApp } from '../../context/AppContext';
import MapMarker from './MapMarker';
import MapInfoWindow from './MapInfoWindow';
import './MapView.css';

const libraries = ['places', 'geometry'];

// Translations for map interface
const translations = {
  ar: {
    loadingError: 'خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.',
    loading: 'جاري تحميل الخريطة...',
    jobCount: (count) => `${count} وظيفة على الخريطة`,
    noJobs: 'لا توجد وظائف على الخريطة',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    fullscreen: 'ملء الشاشة',
    mapType: 'نوع الخريطة',
    satellite: 'قمر صناعي',
    roadmap: 'خريطة الطرق',
    terrain: 'التضاريس',
    hybrid: 'هجين'
  },
  en: {
    loadingError: 'Error loading map. Please try again later.',
    loading: 'Loading map...',
    jobCount: (count) => `${count} job${count !== 1 ? 's' : ''} on map`,
    noJobs: 'No jobs on map',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Fullscreen',
    mapType: 'Map type',
    satellite: 'Satellite',
    roadmap: 'Roadmap',
    terrain: 'Terrain',
    hybrid: 'Hybrid'
  },
  fr: {
    loadingError: 'Erreur de chargement de la carte. Veuillez réessayer plus tard.',
    loading: 'Chargement de la carte...',
    jobCount: (count) => `${count} emploi${count !== 1 ? 's' : ''} sur la carte`,
    noJobs: 'Aucun emploi sur la carte',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    fullscreen: 'Plein écran',
    mapType: 'Type de carte',
    satellite: 'Satellite',
    roadmap: 'Carte routière',
    terrain: 'Terrain',
    hybrid: 'Hybride'
  }
};

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 24.7136, // مركز السعودية
  lng: 46.6753
};

const defaultZoom = 6;

/**
 * MapView Component - عرض الوظائف على خريطة تفاعلية مع clustering
 * 
 * Features:
 * - عرض الوظائف كعلامات على الخريطة
 * - Clustering تلقائي للعلامات عند التصغير
 * - Info windows عند النقر على العلامة
 * - دعم البحث الجغرافي (دائرة/مربع)
 * - دعم RTL/LTR
 * - دعم متعدد اللغات (ar, en, fr)
 * 
 * @param {Array} jobs - قائمة الوظائف مع الإحداثيات
 * @param {Function} onJobClick - callback عند النقر على وظيفة
 * @param {Function} onBoundsChange - callback عند تغيير حدود الخريطة
 * @param {Object} center - مركز الخريطة الافتراضي
 * @param {Number} zoom - مستوى التكبير الافتراضي
 */
const MapView = ({
  jobs = [],
  onJobClick,
  onBoundsChange,
  center = defaultCenter,
  zoom = defaultZoom
}) => {
  const { language } = useApp();
  const [map, setMap] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [markers, setMarkers] = useState([]);
  const clustererRef = useRef(null);

  // Get translations for current language
  const t = translations[language] || translations.ar;

  // تحميل Google Maps API with language support
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
    language: language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en',
    region: language === 'ar' ? 'SA' : language === 'fr' ? 'FR' : 'US'
  });

  // تحويل الوظائف إلى markers
  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setMarkers([]);
      return;
    }

    const validMarkers = jobs
      .filter(job => 
        job.location?.coordinates?.lat && 
        job.location?.coordinates?.lng
      )
      .map(job => ({
        id: job._id,
        position: {
          lat: job.location.coordinates.lat,
          lng: job.location.coordinates.lng
        },
        job
      }));

    setMarkers(validMarkers);
  }, [jobs]);

  // عند تحميل الخريطة
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // عند إلغاء تحميل الخريطة
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // عند تغيير حدود الخريطة
  const handleBoundsChanged = useCallback(() => {
    if (!map || !onBoundsChange) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    onBoundsChange({
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng()
    });
  }, [map, onBoundsChange]);

  // عند النقر على marker
  const handleMarkerClick = useCallback((marker) => {
    setSelectedJob(marker.job);
    if (onJobClick) {
      onJobClick(marker.job);
    }
  }, [onJobClick]);

  // إغلاق info window
  const handleInfoWindowClose = useCallback(() => {
    setSelectedJob(null);
  }, []);

  // خيارات Clusterer
  const clustererOptions = {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    gridSize: 60,
    maxZoom: 15,
    minimumClusterSize: 2,
    averageCenter: true,
    zoomOnClick: true,
    styles: [
      {
        textColor: 'white',
        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png',
        height: 53,
        width: 53
      },
      {
        textColor: 'white',
        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m2.png',
        height: 56,
        width: 56
      },
      {
        textColor: 'white',
        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png',
        height: 66,
        width: 66
      },
      {
        textColor: 'white',
        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m4.png',
        height: 78,
        width: 78
      },
      {
        textColor: 'white',
        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m5.png',
        height: 90,
        width: 90
      }
    ]
  };

  if (loadError) {
    return (
      <div className="map-error" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <p>{t.loadingError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="map-view-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="map-stats">
        <span className="job-count">
          {markers.length > 0 ? t.jobCount(markers.length) : t.noJobs}
        </span>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onBoundsChanged={handleBoundsChanged}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeControlOptions: {
            style: window.google?.maps?.MapTypeControlStyle?.HORIZONTAL_BAR,
            position: language === 'ar' 
              ? window.google?.maps?.ControlPosition?.TOP_LEFT 
              : window.google?.maps?.ControlPosition?.TOP_RIGHT,
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
          },
          zoomControlOptions: {
            position: language === 'ar'
              ? window.google?.maps?.ControlPosition?.LEFT_CENTER
              : window.google?.maps?.ControlPosition?.RIGHT_CENTER
          },
          fullscreenControlOptions: {
            position: language === 'ar'
              ? window.google?.maps?.ControlPosition?.LEFT_TOP
              : window.google?.maps?.ControlPosition?.RIGHT_TOP
          }
        }}
      >
        {markers.length > 0 && (
          <MarkerClusterer
            options={clustererOptions}
            onLoad={(clusterer) => {
              clustererRef.current = clusterer;
            }}
          >
            {(clusterer) =>
              markers.map((marker) => (
                <MapMarker
                  key={marker.id}
                  position={marker.position}
                  job={marker.job}
                  onClick={() => handleMarkerClick(marker)}
                  clusterer={clusterer}
                />
              ))
            }
          </MarkerClusterer>
        )}

        {selectedJob && (
          <MapInfoWindow
            job={selectedJob}
            position={{
              lat: selectedJob.location.coordinates.lat,
              lng: selectedJob.location.coordinates.lng
            }}
            onClose={handleInfoWindowClose}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;
