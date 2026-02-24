import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaShieldAlt, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * مكون تنبيه الجهاز الجديد
 * يظهر عندما يتم اكتشاف تسجيل دخول من جهاز جديد
 */
const NewDeviceAlert = ({ notification, onClose, onTrust }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!notification || notification.type !== 'new_device_login') {
    return null;
  }

  const { deviceInfo, location } = notification.relatedData || {};

  const handleTrustDevice = async () => {
    setLoading(true);
    try {
      await onTrust(notification.relatedData.deviceId);
      onClose();
    } catch (error) {
      console.error('خطأ في تحديد الجهاز كموثوق:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/settings/security');
    onClose();
  };

  const handleViewDevices = () => {
    navigate('/devices');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl" />
            <h3 className="text-lg font-bold">تنبيه أمني</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-700 rounded-full p-1 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              تم تسجيل الدخول من جهاز جديد
            </h4>
            <p className="text-gray-600 text-sm">
              {notification.message}
            </p>
          </div>

          {/* Device Details */}
          {deviceInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">نوع الجهاز:</span>
                <span className="font-medium text-gray-900">
                  {deviceInfo.deviceType === 'mobile' ? 'هاتف محمول' :
                   deviceInfo.deviceType === 'tablet' ? 'جهاز لوحي' :
                   'حاسوب'}
                </span>
              </div>
              
              {deviceInfo.browser && (
                <div className="flex justify-between">
                  <span className="text-gray-600">المتصفح:</span>
                  <span className="font-medium text-gray-900">
                    {deviceInfo.browser.name} {deviceInfo.browser.version}
                  </span>
                </div>
              )}
              
              {deviceInfo.os && (
                <div className="flex justify-between">
                  <span className="text-gray-600">نظام التشغيل:</span>
                  <span className="font-medium text-gray-900">
                    {deviceInfo.os.name} {deviceInfo.os.version}
                  </span>
                </div>
              )}
              
              {location && (location.city || location.country) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">الموقع:</span>
                  <span className="font-medium text-gray-900">
                    {location.city && `${location.city}, `}
                    {location.country}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>هل كنت أنت؟</strong> إذا لم تقم بتسجيل الدخول من هذا الجهاز، 
              قم بتغيير كلمة المرور فوراً وراجع الأجهزة المسجلة.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleTrustDevice}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <FaShieldAlt />
              نعم، كنت أنا - تحديد كموثوق
            </button>

            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FaKey />
              لم أكن أنا - تغيير كلمة المرور
            </button>

            <button
              onClick={handleViewDevices}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              عرض جميع الأجهزة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeviceAlert;
