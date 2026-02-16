// أداة إعادة تعيين الإعدادات للاختبار
// يمكن استخدامها في console المتصفح لإعادة تعيين التطبيق للحالة الأولى

import notificationManager from '../services/notificationManager';
import notificationSoundManager from '../services/notificationSounds';
import { resetOnboarding, getSavedSettings } from './onboardingUtils';

export const resetAppSettings = () => {
  try {
    // استخدام الأداة المساعدة لإعادة تعيين الإعداد الأولي
    resetOnboarding();
    
    // إزالة إعدادات إضافية
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remembered_user');
    
    console.log('✅ App settings reset successfully');
    console.log('🔄 Reload the page to see language selection again');
    
    // إعادة تحميل الصفحة
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Failed to reset app settings:', error);
  }
};

// دالة لعرض الإعدادات الحالية
export const showCurrentSettings = () => {
  const settings = getSavedSettings();
  console.log('📋 Current app settings:', settings);
  return settings;
};

// دوال اختبار الإشعارات
export const testIndividualNotification = async () => {
  try {
    await notificationManager.testNotification('individual');
    console.log('✅ Individual notification test sent');
  } catch (error) {
    console.error('❌ Failed to test individual notification:', error);
  }
};

export const testCompanyNotification = async () => {
  try {
    await notificationManager.testNotification('company');
    console.log('✅ Company notification test sent');
  } catch (error) {
    console.error('❌ Failed to test company notification:', error);
  }
};

export const testNotificationSounds = async () => {
  console.log('🔊 Testing notification sounds...');
  
  // اختبار أصوات الأفراد
  console.log('👤 Testing individual sounds:');
  notificationSoundManager.play('jobAccepted');
  
  setTimeout(async () => {
    // اختبار أصوات الشركات
    console.log('🏢 Testing company sounds:');
    notificationSoundManager.play('newApplication');
  }, 2000);
};

// تصدير للاستخدام في console
window.resetAppSettings = resetAppSettings;
window.showCurrentSettings = showCurrentSettings;
window.testIndividualNotification = testIndividualNotification;
window.testCompanyNotification = testCompanyNotification;
window.testNotificationSounds = testNotificationSounds;

export default resetAppSettings;