// أداة إعادة تعيين الإعدادات للاختبار
// يمكن استخدامها في console المتصفح لإعادة تعيين التطبيق للحالة الأولى

import notificationManager from '../services/notificationManager';
import { testNotificationSound } from '../services/notificationSounds';

export const resetAppSettings = () => {
  try {
    // إزالة جميع الإعدادات من localStorage
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('lang');
    localStorage.removeItem('audioConsent');
    localStorage.removeItem('audio_enabled');
    localStorage.removeItem('musicEnabled');
    localStorage.removeItem('notificationsEnabled');
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
  await testNotificationSound('individual', 'jobAccepted');
  
  setTimeout(async () => {
    // اختبار أصوات الشركات
    console.log('🏢 Testing company sounds:');
    await testNotificationSound('company', 'paymentReceived');
  }, 2000);
};

// تصدير للاستخدام في console
window.resetAppSettings = resetAppSettings;
window.testIndividualNotification = testIndividualNotification;
window.testCompanyNotification = testCompanyNotification;
window.testNotificationSounds = testNotificationSounds;

export default resetAppSettings;