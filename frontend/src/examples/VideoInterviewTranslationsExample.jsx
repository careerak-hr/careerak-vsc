/**
 * Video Interview Translations Example
 * مثال على استخدام نظام الترجمات المركزي لنظام الفيديو للمقابلات
 * 
 * يوضح هذا المثال:
 * - كيفية استخدام useVideoInterviewSection hook
 * - كيفية الوصول لأقسام مختلفة من الترجمات
 * - كيفية التبديل بين اللغات
 */

import React, { useState } from 'react';
import { useVideoInterviewTranslations, useVideoInterviewSection } from '../hooks/useVideoInterviewTranslations';
import { useApp } from '../context/AppContext';

const VideoInterviewTranslationsExample = () => {
  const { language, setLanguage } = useApp();
  
  // الطريقة 1: الحصول على جميع الترجمات
  const allTranslations = useVideoInterviewTranslations();
  
  // الطريقة 2: الحصول على أقسام محددة (موصى به)
  const videoCallT = useVideoInterviewSection('videoCall');
  const deviceTestT = useVideoInterviewSection('deviceTest');
  const waitingRoomT = useVideoInterviewSection('waitingRoom');
  const recordingT = useVideoInterviewSection('recording');
  const screenShareT = useVideoInterviewSection('screenShare');
  const chatT = useVideoInterviewSection('chat');
  const connectionQualityT = useVideoInterviewSection('connectionQuality');
  const raiseHandT = useVideoInterviewSection('raiseHand');
  const groupCallT = useVideoInterviewSection('groupCall');
  const commonT = useVideoInterviewSection('common');
  const errorsT = useVideoInterviewSection('errors');

  const [activeSection, setActiveSection] = useState('videoCall');

  const sections = {
    videoCall: {
      title: 'Video Call',
      translations: videoCallT,
      keys: ['title', 'connecting', 'muteAudio', 'shareScreen', 'endCall']
    },
    deviceTest: {
      title: 'Device Test',
      translations: deviceTestT,
      keys: ['title', 'cameraLabel', 'microphoneLabel', 'testCamera', 'continue']
    },
    waitingRoom: {
      title: 'Waiting Room',
      translations: waitingRoomT,
      keys: ['title', 'waiting', 'position', 'waitingTime', 'admitted']
    },
    recording: {
      title: 'Recording',
      translations: recordingT,
      keys: ['startRecording', 'stopRecording', 'recording', 'consentRequired']
    },
    screenShare: {
      title: 'Screen Share',
      translations: screenShareT,
      keys: ['startSharing', 'stopSharing', 'sharing', 'youAreSharing']
    },
    chat: {
      title: 'Chat',
      translations: chatT,
      keys: ['title', 'placeholder', 'send', 'typing', 'noMessages']
    },
    connectionQuality: {
      title: 'Connection Quality',
      translations: connectionQualityT,
      keys: ['title', 'excellent', 'good', 'fair', 'poor']
    },
    raiseHand: {
      title: 'Raise Hand',
      translations: raiseHandT,
      keys: ['raise', 'lower', 'raised', 'notification']
    },
    groupCall: {
      title: 'Group Call',
      translations: groupCallT,
      keys: ['participants', 'gridView', 'speakerView', 'muteAll', 'host']
    },
    common: {
      title: 'Common',
      translations: commonT,
      keys: ['close', 'cancel', 'confirm', 'save', 'delete', 'send']
    },
    errors: {
      title: 'Errors',
      translations: errorsT,
      keys: ['connectionFailed', 'cameraAccessDenied', 'networkError', 'tryAgain']
    }
  };

  const currentSection = sections[activeSection];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Video Interview Translations Example</h1>
        <p style={styles.subtitle}>مثال على نظام الترجمات المركزي</p>
        
        {/* Language Switcher */}
        <div style={styles.languageSwitcher}>
          <button
            onClick={() => setLanguage('ar')}
            style={{
              ...styles.langButton,
              ...(language === 'ar' ? styles.langButtonActive : {})
            }}
          >
            العربية
          </button>
          <button
            onClick={() => setLanguage('en')}
            style={{
              ...styles.langButton,
              ...(language === 'en' ? styles.langButtonActive : {})
            }}
          >
            English
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Section Selector */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Sections</h3>
          {Object.keys(sections).map(key => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                ...styles.sectionButton,
                ...(activeSection === key ? styles.sectionButtonActive : {})
              }}
            >
              {sections[key].title}
            </button>
          ))}
        </div>

        {/* Translations Display */}
        <div style={styles.main}>
          <h2 style={styles.sectionTitle}>{currentSection.title}</h2>
          <div style={styles.translationsGrid}>
            {currentSection.keys.map(key => (
              <div key={key} style={styles.translationCard}>
                <div style={styles.translationKey}>{key}</div>
                <div style={styles.translationValue}>
                  {currentSection.translations[key]}
                </div>
              </div>
            ))}
          </div>

          {/* Usage Example */}
          <div style={styles.usageExample}>
            <h3 style={styles.usageTitle}>Usage Example:</h3>
            <pre style={styles.codeBlock}>
{`import { useVideoInterviewSection } from '../hooks/useVideoInterviewTranslations';

function MyComponent() {
  const t = useVideoInterviewSection('${activeSection}');
  
  return (
    <div>
      <h1>{t.${currentSection.keys[0]}}</h1>
      <button>{t.${currentSection.keys[1] || currentSection.keys[0]}}</button>
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>14</div>
          <div style={styles.statLabel}>Sections</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>200+</div>
          <div style={styles.statLabel}>Translation Keys</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>2</div>
          <div style={styles.statLabel}>Languages</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>20+</div>
          <div style={styles.statLabel}>Components</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px',
  },
  languageSwitcher: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  langButton: {
    padding: '10px 20px',
    border: '2px solid #D48161',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
  langButtonActive: {
    background: '#D48161',
    color: 'white',
  },
  content: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  sidebar: {
    width: '200px',
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#304B60',
  },
  sectionButton: {
    width: '100%',
    padding: '10px',
    marginBottom: '8px',
    border: 'none',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  sectionButtonActive: {
    background: '#304B60',
    color: 'white',
  },
  main: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '20px',
  },
  translationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  translationCard: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
  },
  translationKey: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
    fontFamily: 'monospace',
  },
  translationValue: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500',
  },
  usageExample: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
  },
  usageTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#304B60',
  },
  codeBlock: {
    background: '#263238',
    color: '#aed581',
    padding: '15px',
    borderRadius: '6px',
    overflow: 'auto',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #304B60 0%, #D48161 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9,
  },
};

export default VideoInterviewTranslationsExample;

