/**
 * Video Interview Translations Tests
 * اختبارات نظام الترجمات لنظام الفيديو للمقابلات
 */

import { describe, it, expect } from 'vitest';
import videoInterviewTranslations from '../translations/videoInterviewTranslations';

describe('Video Interview Translations', () => {
  describe('Structure', () => {
    it('should have Arabic translations', () => {
      expect(videoInterviewTranslations.ar).toBeDefined();
    });

    it('should have English translations', () => {
      expect(videoInterviewTranslations.en).toBeDefined();
    });

    it('should have all required sections in Arabic', () => {
      const requiredSections = [
        'common',
        'videoCall',
        'deviceTest',
        'waitingRoom',
        'recording',
        'screenShare',
        'chat',
        'connectionQuality',
        'raiseHand',
        'groupCall',
        'interviewManagement',
        'interviewNotes',
        'timer',
        'errors'
      ];

      requiredSections.forEach(section => {
        expect(videoInterviewTranslations.ar[section]).toBeDefined();
      });
    });

    it('should have all required sections in English', () => {
      const requiredSections = [
        'common',
        'videoCall',
        'deviceTest',
        'waitingRoom',
        'recording',
        'screenShare',
        'chat',
        'connectionQuality',
        'raiseHand',
        'groupCall',
        'interviewManagement',
        'interviewNotes',
        'timer',
        'errors'
      ];

      requiredSections.forEach(section => {
        expect(videoInterviewTranslations.en[section]).toBeDefined();
      });
    });
  });

  describe('Common Section', () => {
    it('should have common translations in Arabic', () => {
      const { common } = videoInterviewTranslations.ar;
      
      expect(common.close).toBe('إغلاق');
      expect(common.cancel).toBe('إلغاء');
      expect(common.confirm).toBe('تأكيد');
      expect(common.save).toBe('حفظ');
      expect(common.delete).toBe('حذف');
    });

    it('should have common translations in English', () => {
      const { common } = videoInterviewTranslations.en;
      
      expect(common.close).toBe('Close');
      expect(common.cancel).toBe('Cancel');
      expect(common.confirm).toBe('Confirm');
      expect(common.save).toBe('Save');
      expect(common.delete).toBe('Delete');
    });
  });

  describe('Video Call Section', () => {
    it('should have video call translations in Arabic', () => {
      const { videoCall } = videoInterviewTranslations.ar;
      
      expect(videoCall.title).toBe('مقابلة فيديو');
      expect(videoCall.muteAudio).toBe('كتم الصوت');
      expect(videoCall.shareScreen).toBe('مشاركة الشاشة');
      expect(videoCall.endCall).toBe('إنهاء المكالمة');
    });

    it('should have video call translations in English', () => {
      const { videoCall } = videoInterviewTranslations.en;
      
      expect(videoCall.title).toBe('Video Interview');
      expect(videoCall.muteAudio).toBe('Mute Audio');
      expect(videoCall.shareScreen).toBe('Share Screen');
      expect(videoCall.endCall).toBe('End Call');
    });
  });

  describe('Device Test Section', () => {
    it('should have device test translations in Arabic', () => {
      const { deviceTest } = videoInterviewTranslations.ar;
      
      expect(deviceTest.title).toBe('اختبار الكاميرا والميكروفون');
      expect(deviceTest.cameraLabel).toBe('الكاميرا');
      expect(deviceTest.microphoneLabel).toBe('الميكروفون');
    });

    it('should have device test translations in English', () => {
      const { deviceTest } = videoInterviewTranslations.en;
      
      expect(deviceTest.title).toBe('Camera and Microphone Test');
      expect(deviceTest.cameraLabel).toBe('Camera');
      expect(deviceTest.microphoneLabel).toBe('Microphone');
    });
  });

  describe('Waiting Room Section', () => {
    it('should have waiting room translations in Arabic', () => {
      const { waitingRoom } = videoInterviewTranslations.ar;
      
      expect(waitingRoom.title).toBe('غرفة الانتظار');
      expect(waitingRoom.waiting).toBe('في الانتظار...');
      expect(waitingRoom.position).toBe('موقعك في الطابور');
    });

    it('should have waiting room translations in English', () => {
      const { waitingRoom } = videoInterviewTranslations.en;
      
      expect(waitingRoom.title).toBe('Waiting Room');
      expect(waitingRoom.waiting).toBe('Waiting...');
      expect(waitingRoom.position).toBe('Your Position');
    });
  });

  describe('Recording Section', () => {
    it('should have recording translations in Arabic', () => {
      const { recording } = videoInterviewTranslations.ar;
      
      expect(recording.startRecording).toBe('بدء التسجيل');
      expect(recording.stopRecording).toBe('إيقاف التسجيل');
      expect(recording.recording).toBe('جاري التسجيل');
    });

    it('should have recording translations in English', () => {
      const { recording } = videoInterviewTranslations.en;
      
      expect(recording.startRecording).toBe('Start Recording');
      expect(recording.stopRecording).toBe('Stop Recording');
      expect(recording.recording).toBe('Recording');
    });
  });

  describe('Screen Share Section', () => {
    it('should have screen share translations in Arabic', () => {
      const { screenShare } = videoInterviewTranslations.ar;
      
      expect(screenShare.startSharing).toBe('مشاركة الشاشة');
      expect(screenShare.stopSharing).toBe('إيقاف المشاركة');
    });

    it('should have screen share translations in English', () => {
      const { screenShare } = videoInterviewTranslations.en;
      
      expect(screenShare.startSharing).toBe('Share Screen');
      expect(screenShare.stopSharing).toBe('Stop Sharing');
    });
  });

  describe('Chat Section', () => {
    it('should have chat translations in Arabic', () => {
      const { chat } = videoInterviewTranslations.ar;
      
      expect(chat.title).toBe('الدردشة');
      expect(chat.send).toBe('إرسال');
      expect(chat.typing).toBe('يكتب...');
    });

    it('should have chat translations in English', () => {
      const { chat } = videoInterviewTranslations.en;
      
      expect(chat.title).toBe('Chat');
      expect(chat.send).toBe('Send');
      expect(chat.typing).toBe('typing...');
    });
  });

  describe('Connection Quality Section', () => {
    it('should have connection quality translations in Arabic', () => {
      const { connectionQuality } = videoInterviewTranslations.ar;
      
      expect(connectionQuality.excellent).toBe('ممتازة');
      expect(connectionQuality.good).toBe('جيدة');
      expect(connectionQuality.poor).toBe('ضعيفة');
    });

    it('should have connection quality translations in English', () => {
      const { connectionQuality } = videoInterviewTranslations.en;
      
      expect(connectionQuality.excellent).toBe('Excellent');
      expect(connectionQuality.good).toBe('Good');
      expect(connectionQuality.poor).toBe('Poor');
    });
  });

  describe('Errors Section', () => {
    it('should have error translations in Arabic', () => {
      const { errors } = videoInterviewTranslations.ar;
      
      expect(errors.connectionFailed).toBe('فشل الاتصال');
      expect(errors.networkError).toBe('خطأ في الشبكة');
    });

    it('should have error translations in English', () => {
      const { errors } = videoInterviewTranslations.en;
      
      expect(errors.connectionFailed).toBe('Connection Failed');
      expect(errors.networkError).toBe('Network Error');
    });
  });

  describe('Consistency', () => {
    it('should have same keys in Arabic and English for all sections', () => {
      const arSections = Object.keys(videoInterviewTranslations.ar);
      const enSections = Object.keys(videoInterviewTranslations.en);
      
      expect(arSections.sort()).toEqual(enSections.sort());
    });

    it('should have same keys within each section', () => {
      const sections = Object.keys(videoInterviewTranslations.ar);
      
      sections.forEach(section => {
        const arKeys = Object.keys(videoInterviewTranslations.ar[section]);
        const enKeys = Object.keys(videoInterviewTranslations.en[section]);
        
        expect(arKeys.sort()).toEqual(enKeys.sort());
      });
    });

    it('should not have empty strings', () => {
      const checkEmpty = (obj, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkEmpty(value, currentPath);
          }
        });
      };

      checkEmpty(videoInterviewTranslations.ar, 'ar');
      checkEmpty(videoInterviewTranslations.en, 'en');
    });
  });
});

