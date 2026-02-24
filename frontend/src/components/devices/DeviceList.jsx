import React, { useState, useEffect } from 'react';
import { 
  FaDesktop, 
  FaMobileAlt, 
  FaTabletAlt, 
  FaCheck, 
  FaTrash, 
  FaShieldAlt,
  FaExclamationTriangle 
} from 'react-icons/fa';
import axios from 'axios';

/**
 * مكون عرض قائمة الأجهزة المسجلة
 */
const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/devices`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setDevices(response.data.data.devices);
      }
    } catch (err) {
      console.error('خطأ في جلب الأجهزة:', err);
      setError('فشل في تحميل الأجهزة');
    } finally {
      setLoading(false);
    }
  };

  const handleTrustDevice = async (deviceId) => {
    try {
      setActionLoading(deviceId);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/devices/${deviceId}/trust`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // تحديث القائمة
        setDevices(devices.map(device => 
          device.id === deviceId 
            ? { ...device, isTrusted: true }
            : device
        ));
      }
    } catch (err) {
      console.error('خطأ في تحديد الجهاز كموثوق:', err);
      alert('فشل في تحديد الجهاز كموثوق');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveDevice = async (deviceId, isCurrentDevice) => {
    if (isCurrentDevice) {
      alert('لا يمكنك حذف الجهاز الحالي');
      return;
    }

    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
      return;
    }

    try {
      setActionLoading(deviceId);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/devices/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // إزالة من القائمة
        setDevices(devices.filter(device => device.id !== deviceId));
      }
    } catch (err) {
      console.error('خطأ في حذف الجهاز:', err);
      alert('فشل في حذف الجهاز');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveOtherDevices = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الأجهزة الأخرى؟ سيتم الاحتفاظ بالجهاز الحالي فقط.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/devices/others/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // تحديث القائمة
        await fetchDevices();
        alert(`تم حذف ${response.data.data.removedCount} جهاز بنجاح`);
      }
    } catch (err) {
      console.error('خطأ في حذف الأجهزة:', err);
      alert('فشل في حذف الأجهزة');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <FaMobileAlt className="text-2xl" />;
      case 'tablet':
        return <FaTabletAlt className="text-2xl" />;
      case 'desktop':
      default:
        return <FaDesktop className="text-2xl" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <FaExclamationTriangle className="inline ml-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الأجهزة المسجلة</h2>
          <p className="text-gray-600 mt-1">
            إدارة الأجهزة التي تم تسجيل الدخول منها
          </p>
        </div>
        
        {devices.length > 1 && (
          <button
            onClick={handleRemoveOtherDevices}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FaTrash />
            حذف الأجهزة الأخرى
          </button>
        )}
      </div>

      {/* Devices List */}
      <div className="grid gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`
              bg-white rounded-lg shadow-md p-6 border-2 transition-all
              ${device.isCurrentDevice ? 'border-primary bg-primary/5' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between">
              {/* Device Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className={`
                  p-3 rounded-lg
                  ${device.isCurrentDevice ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {getDeviceIcon(device.deviceType)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {device.description}
                    </h3>
                    
                    {device.isCurrentDevice && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        الجهاز الحالي
                      </span>
                    )}
                    
                    {device.isTrusted && (
                      <FaShieldAlt className="text-green-500" title="جهاز موثوق" />
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">المتصفح:</span>{' '}
                      {device.browser.name} {device.browser.version}
                    </p>
                    <p>
                      <span className="font-medium">نظام التشغيل:</span>{' '}
                      {device.os.name} {device.os.version}
                    </p>
                    {(device.location.city || device.location.country) && (
                      <p>
                        <span className="font-medium">الموقع:</span>{' '}
                        {device.location.city && `${device.location.city}, `}
                        {device.location.country}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">آخر تسجيل دخول:</span>{' '}
                      {formatDate(device.lastLoginAt)}
                    </p>
                    <p>
                      <span className="font-medium">عدد مرات الدخول:</span>{' '}
                      {device.loginCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {!device.isTrusted && (
                  <button
                    onClick={() => handleTrustDevice(device.id)}
                    disabled={actionLoading === device.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <FaCheck />
                    تحديد كموثوق
                  </button>
                )}
                
                {!device.isCurrentDevice && (
                  <button
                    onClick={() => handleRemoveDevice(device.id, device.isCurrentDevice)}
                    disabled={actionLoading === device.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <FaTrash />
                    حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaDesktop className="text-6xl mx-auto mb-4 opacity-50" />
          <p>لا توجد أجهزة مسجلة</p>
        </div>
      )}
    </div>
  );
};

export default DeviceList;
