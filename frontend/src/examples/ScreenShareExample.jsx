import React, { useState, useEffect } from 'react';
import ScreenShareService from '../services/ScreenShareService';
import ScreenShareControls from '../components/VideoCall/ScreenShareControls';
import ScreenShareDisplay from '../components/VideoCall/ScreenShareDisplay';

/**
 * ScreenShareExample Component
 * مثال على استخدام مشاركة الشاشة
 * 
 * Demonstrates:
 * - Starting screen share
 * - Stopping screen share
 * - Switching sources
 * - Displaying shared screen
 * - Quality indicators
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
const ScreenShareExample = () => {
  const [screenShareService] = useState(() => new ScreenShareService());
  const [isSharing, setIsSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const [screenShareSettings, setScreenShareSettings] = useState(null);
  const [language, setLanguage] = useState('ar');
  const [error, setError] = useState(null);

  // Check if screen sharing is supported
  const isSupported = ScreenShareService.isSupported();

  // Update state when sharing status changes
  useEffect(() => {
    const updateState = () => {
      setIsSharing(screenShareService.isScreenSharing());
      setScreenStream(screenShareService.getScreenStream());
      setCurrentSource(screenShareService.getCurrentSource());
      setScreenShareSettings(screenShareService.getScreenShareSettings());
    };

    // Update immediately
    updateState();

    // Set up interval to check for changes
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [screenShareService]);

  const handleStartSharing = async (options) => {
    try {
      setError(null);
      const stream = await screenShareService.startScreenShare(options);
      setScreenStream(stream);
      setIsSharing(true);
      setCurrentSource(screenShareService.getCurrentSource());
      setScreenShareSettings(screenShareService.getScreenShareSettings());
      
      console.log('Screen sharing started successfully');
    } catch (err) {
      console.error('Failed to start screen sharing:', err);
      setError(err.message);
    }
  };

  const handleStopSharing = async () => {
    try {
      setError(null);
      screenShareService.stopScreenShare();
      setScreenStream(null);
      setIsSharing(false);
      setCurrentSource(null);
      setScreenShareSettings(null);
      
      console.log('Screen sharing stopped successfully');
    } catch (err) {
      console.error('Failed to stop screen sharing:', err);
      setError(err.message);
    }
  };

  const handleSwitchSource = async (options) => {
    try {
      setError(null);
      const stream = await screenShareService.switchSource(options);
      setScreenStream(stream);
      setCurrentSource(screenShareService.getCurrentSource());
      setScreenShareSettings(screenShareService.getScreenShareSettings());
      
      console.log('Screen share source switched successfully');
    } catch (err) {
      console.error('Failed to switch source:', err);
      setError(err.message);
    }
  };

  if (!isSupported) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>❌ Screen Sharing Not Supported</h2>
          <p>Your browser does not support screen sharing.</p>
          <p>Please use a modern browser like Chrome, Firefox, or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🖥️ Screen Share Example</h1>
        <p>مثال على مشاركة الشاشة مع دعم 1080p</p>
        
        {/* Language Selector */}
        <div style={styles.languageSelector}>
          <button
            style={{
              ...styles.langBtn,
              ...(language === 'ar' ? styles.langBtnActive : {})
            }}
            onClick={() => setLanguage('ar')}
          >
            العربية
          </button>
          <button
            style={{
              ...styles.langBtn,
              ...(language === 'en' ? styles.langBtnActive : {})
            }}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            style={{
              ...styles.langBtn,
              ...(language === 'fr' ? styles.langBtnActive : {})
            }}
            onClick={() => setLanguage('fr')}
          >
            Français
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeBtn}>
            ✕
          </button>
        </div>
      )}

      {/* Screen Share Controls */}
      <div style={styles.controls}>
        <ScreenShareControls
          isSharing={isSharing}
          onStartSharing={handleStartSharing}
          onStopSharing={handleStopSharing}
          onSwitchSource={handleSwitchSource}
          currentSource={currentSource}
          screenShareSettings={screenShareSettings}
          language={language}
          showSourceSelector={true}
          showQualityIndicator={true}
        />
      </div>

      {/* Screen Share Display */}
      <div style={styles.display}>
        <ScreenShareDisplay
          screenStream={screenStream}
          isSharing={isSharing}
          sharerName="You"
          currentSource={currentSource}
          screenShareSettings={screenShareSettings}
          language={language}
          showControls={true}
        />
      </div>

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        <h3>📊 Screen Share Info</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <strong>Status:</strong>
            <span style={{
              color: isSharing ? '#4CAF50' : '#666',
              fontWeight: 600
            }}>
              {isSharing ? '🟢 Sharing' : '⚪ Not Sharing'}
            </span>
          </div>
          
          {screenShareSettings && (
            <>
              <div style={styles.infoItem}>
                <strong>Resolution:</strong>
                <span>{screenShareSettings.width}x{screenShareSettings.height}</span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>Quality:</strong>
                <span style={{ color: '#4CAF50', fontWeight: 600 }}>
                  {screenShareSettings.quality}
                </span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>Frame Rate:</strong>
                <span>{screenShareSettings.frameRate} FPS</span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>Source:</strong>
                <span>{currentSource || 'N/A'}</span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>Display Surface:</strong>
                <span>{screenShareSettings.displaySurface}</span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>Cursor:</strong>
                <span>{screenShareSettings.cursor}</span>
              </div>
              
              <div style={styles.infoItem}>
                <strong>HD Quality:</strong>
                <span style={{
                  color: screenShareSettings.isHD ? '#4CAF50' : '#F44336',
                  fontWeight: 600
                }}>
                  {screenShareSettings.isHD ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.instructions}>
        <h3>📝 Instructions</h3>
        <ol>
          <li>Click "Share Screen" button to start sharing</li>
          <li>Select what you want to share (entire screen, window, or tab)</li>
          <li>Your screen will be displayed in the preview area</li>
          <li>Click "Switch Source" to change what you're sharing</li>
          <li>Click "Stop Sharing" to end the screen share</li>
        </ol>
        
        <h4>Features:</h4>
        <ul>
          <li>✅ High quality (1080p) screen sharing</li>
          <li>✅ Share entire screen, specific window, or browser tab</li>
          <li>✅ Switch between sources without stopping</li>
          <li>✅ Quality indicator showing resolution and quality level</li>
          <li>✅ Multi-language support (Arabic, English, French)</li>
          <li>✅ Responsive design for all devices</li>
        </ul>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  languageSelector: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px'
  },
  langBtn: {
    padding: '8px 16px',
    border: '2px solid #304B60',
    borderRadius: '6px',
    background: 'white',
    color: '#304B60',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.3s ease'
  },
  langBtnActive: {
    background: '#304B60',
    color: 'white'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '8px',
    color: '#c62828',
    marginBottom: '20px'
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#c62828'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  display: {
    width: '100%',
    height: '500px',
    marginBottom: '30px',
    border: '2px solid #304B60',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  infoPanel: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  instructions: {
    background: '#e3f2fd',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #2196F3'
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    background: '#ffebee',
    borderRadius: '12px',
    color: '#c62828'
  }
};

export default ScreenShareExample;
