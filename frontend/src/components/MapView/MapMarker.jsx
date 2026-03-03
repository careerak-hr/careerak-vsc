import React from 'react';
import { Marker } from '@react-google-maps/api';

/**
 * MapMarker Component - علامة وظيفة على الخريطة
 * 
 * @param {Object} position - موقع العلامة {lat, lng}
 * @param {Object} job - بيانات الوظيفة
 * @param {Function} onClick - callback عند النقر
 * @param {Object} clusterer - MarkerClusterer instance
 */
const MapMarker = ({ position, job, onClick, clusterer }) => {
  // أيقونة مخصصة للعلامة
  const icon = {
    url: '/marker-icon.png', // يمكن استبدالها بأيقونة مخصصة
    scaledSize: new window.google.maps.Size(40, 40),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(20, 40)
  };

  return (
    <Marker
      position={position}
      onClick={onClick}
      icon={icon}
      title={job.title}
      clusterer={clusterer}
      animation={window.google.maps.Animation.DROP}
    />
  );
};

export default MapMarker;
