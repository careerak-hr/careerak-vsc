import React from 'react';
import { useApp } from '../context/AppContext';
import DeviceList from '../components/devices/DeviceList';
import { FaShieldAlt } from 'react-icons/fa';

/**
 * صفحة إدارة الأجهزة
 */
const DevicesPage = () => {
  const { language } = useApp();

  const content = {
    ar: {
      title: 'إدارة الأجهزة',
      subtitle: 'تتبع وإدارة الأجهزة التي تم تسجيل الدخول منها',
      securityTitle: 'نصائح الأمان',
      securityTips: [
        'قم بمراجعة الأجهزة المسجلة بانتظام',
        'احذف أي جهاز لا تتعرف عليه فوراً',
        'حدد الأجهزة الموثوقة لتجنب التنبيهات المتكررة',
        'إذا رأيت جهازاً غير معروف، قم بتغيير كلمة المرور فوراً',
        'استخدم المصادقة الثنائية لمزيد من الأمان'
      ]
    },
    en: {
      title: 'Device Management',
      subtitle: 'Track and manage devices that have logged in',
      securityTitle: 'Security Tips',
      securityTips: [
        'Review registered devices regularly',
        'Remove any unrecognized device immediately',
        'Mark trusted devices to avoid repeated alerts',
        'If you see an unknown device, change your password immediately',
        'Use two-factor authentication for extra security'
      ]
    },
    fr: {
      title: 'Gestion des appareils',
      subtitle: 'Suivez et gérez les appareils connectés',
      securityTitle: 'Conseils de sécurité',
      securityTips: [
        'Examinez régulièrement les appareils enregistrés',
        'Supprimez immédiatement tout appareil non reconnu',
        'Marquez les appareils de confiance pour éviter les alertes répétées',
        'Si vous voyez un appareil inconnu, changez votre mot de passe immédiatement',
        'Utilisez l\'authentification à deux facteurs pour plus de sécurité'
      ]
    }
  };

  const t = content[language] || content.ar;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <DeviceList />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaShieldAlt className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.securityTitle}
                </h3>
              </div>

              <ul className="space-y-3">
                {t.securityTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-primary mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>تنبيه:</strong> إذا رأيت جهازاً لا تتعرف عليه، قد يكون حسابك معرضاً للخطر. قم بتغيير كلمة المرور فوراً.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesPage;
