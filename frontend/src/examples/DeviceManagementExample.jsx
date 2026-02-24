import React, { useState, useEffect } from 'react';
import DeviceList from '../components/devices/DeviceList';
import NewDeviceAlert from '../components/devices/NewDeviceAlert';
import axios from 'axios';

/**
 * مثال على استخدام نظام إدارة الأجهزة
 * 
 * هذا المثال يوضح:
 * 1. عرض قائمة الأجهزة
 * 2. التعامل مع إشعارات الأجهزة الجديدة
 * 3. تحديد جهاز كموثوق
 */
const DeviceManagementExample = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNewDeviceAlert, setShowNewDeviceAlert] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // محاكاة استقبال الإشعارات
  useEffect(() => {
    // في التطبيق الحقيقي، ستأتي من WebSocket أو Polling
    fetchNotifications();
    
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const newDeviceNotifications = response.data.data.notifications.filter(
          n => n.type === 'new_device_login' && !n.isRead
        );

        if (newDeviceNotifications.length > 0) {
          setCurrentNotification(newDeviceNotifications[0]);
          setShowNewDeviceAlert(true);
        }

        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    }
  };

  const handleTrustDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/devices/${deviceId}/trust`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // تحديد الإشعار كمقروء
      if (currentNotification) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/notifications/${currentNotification._id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      alert('تم تحديد الجهاز كموثوق بنجاح');
    } catch (error) {
      console.error('خطأ في تحديد الجهاز كموثوق:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مثال: إدارة الأجهزة
          </h1>
          <p className="text-gray-600">
            هذا مثال توضيحي لنظام تتبع وإدارة الأجهزة
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            كيفية الاستخدام:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>سجل دخول من متصفح أو جهاز مختلف</li>
            <li>سيظهر تنبيه تلقائياً بالجهاز الجديد</li>
            <li>يمكنك تحديد الجهاز كموثوق أو تغيير كلمة المرور</li>
            <li>راجع قائمة جميع الأجهزة المسجلة أدناه</li>
            <li>يمكنك حذف أي جهاز لا تتعرف عليه</li>
          </ol>
        </div>

        {/* Device List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            الأجهزة المسجلة
          </h2>
          <DeviceList />
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">مثال الكود:</h3>
          <pre className="text-sm overflow-x-auto">
{`// 1. تفعيل Device Tracking في Backend
const { trackLoginDevice } = require('../middleware/deviceTracking');

router.post('/login',
  authController.login,
  protect,
  trackLoginDevice,  // ← إضافة middleware
  (req, res) => {
    // req.loginDevice - معلومات الجهاز
    // req.isNewDevice - هل الجهاز جديد؟
  }
);

// 2. استخدام DeviceList في Frontend
import DeviceList from '../components/devices/DeviceList';

function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <DeviceList />
    </div>
  );
}

// 3. التعامل مع إشعارات الأجهزة الجديدة
import NewDeviceAlert from '../components/devices/NewDeviceAlert';

function App() {
  const [notification, setNotification] = useState(null);

  return (
    <>
      {notification?.type === 'new_device_login' && (
        <NewDeviceAlert
          notification={notification}
          onClose={() => setNotification(null)}
          onTrust={handleTrustDevice}
        />
      )}
    </>
  );
}`}
          </pre>
        </div>

        {/* API Endpoints */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">API Endpoints:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">
                GET
              </span>
              <div>
                <code className="text-gray-900">/devices</code>
                <p className="text-gray-600 mt-1">الحصول على جميع أجهزة المستخدم</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">
                GET
              </span>
              <div>
                <code className="text-gray-900">/devices/current</code>
                <p className="text-gray-600 mt-1">الحصول على معلومات الجهاز الحالي</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">
                POST
              </span>
              <div>
                <code className="text-gray-900">/devices/:deviceId/trust</code>
                <p className="text-gray-600 mt-1">تحديد جهاز كموثوق</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono">
                DELETE
              </span>
              <div>
                <code className="text-gray-900">/devices/:deviceId</code>
                <p className="text-gray-600 mt-1">حذف جهاز</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono">
                DELETE
              </span>
              <div>
                <code className="text-gray-900">/devices/others/all</code>
                <p className="text-gray-600 mt-1">حذف جميع الأجهزة الأخرى</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Device Alert */}
      {showNewDeviceAlert && currentNotification && (
        <NewDeviceAlert
          notification={currentNotification}
          onClose={() => {
            setShowNewDeviceAlert(false);
            setCurrentNotification(null);
          }}
          onTrust={handleTrustDevice}
        />
      )}
    </div>
  );
};

export default DeviceManagementExample;
