/**
 * WebRTC Configuration
 * STUN/TURN servers configuration for video interviews
 */

// STUN servers (مجانية من Google)
const stunServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

// TURN servers (يمكن استخدام خدمة مجانية أو مدفوعة)
// ملاحظة: يجب تحديث هذه الإعدادات بخادم TURN حقيقي في الإنتاج
const turnServers = [
  {
    urls: process.env.TURN_SERVER_URL || 'turn:turn.careerak.com:3478',
    username: process.env.TURN_USERNAME || 'careerak',
    credential: process.env.TURN_PASSWORD || 'secure_password_here'
  }
];

// ICE servers configuration
const iceServers = [
  ...stunServers,
  ...turnServers
];

// WebRTC configuration
const webrtcConfig = {
  iceServers,
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all', // 'all' or 'relay'
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

// Media constraints
const mediaConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user' // 'user' للكاميرا الأمامية، 'environment' للخلفية
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1
  }
};

// Screen share constraints
const screenShareConstraints = {
  video: {
    cursor: 'always',
    displaySurface: 'monitor', // 'monitor', 'window', 'application', 'browser'
    width: { ideal: 1920, max: 3840 },
    height: { ideal: 1080, max: 2160 },
    frameRate: { ideal: 30, max: 60 }
  },
  audio: false // يمكن تفعيله لمشاركة صوت النظام
};

// Recording constraints
const recordingConstraints = {
  mimeType: 'video/webm;codecs=vp9,opus', // أو 'video/webm;codecs=h264,opus'
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000 // 128 kbps
};

// Connection quality thresholds
const qualityThresholds = {
  excellent: {
    rtt: 100, // Round Trip Time in ms
    packetLoss: 0.5, // percentage
    jitter: 20 // ms
  },
  good: {
    rtt: 200,
    packetLoss: 2,
    jitter: 50
  },
  fair: {
    rtt: 300,
    packetLoss: 5,
    jitter: 100
  },
  poor: {
    rtt: 500,
    packetLoss: 10,
    jitter: 200
  }
};

// Timeouts and limits
const limits = {
  maxParticipants: 10,
  maxDuration: 180, // minutes
  connectionTimeout: 30000, // 30 seconds
  reconnectAttempts: 3,
  reconnectDelay: 2000, // 2 seconds
  iceGatheringTimeout: 10000, // 10 seconds
  offerAnswerTimeout: 10000 // 10 seconds
};

// Helper function to get quality level
function getQualityLevel(stats) {
  const { rtt, packetLoss, jitter } = stats;
  
  if (
    rtt <= qualityThresholds.excellent.rtt &&
    packetLoss <= qualityThresholds.excellent.packetLoss &&
    jitter <= qualityThresholds.excellent.jitter
  ) {
    return 'excellent';
  }
  
  if (
    rtt <= qualityThresholds.good.rtt &&
    packetLoss <= qualityThresholds.good.packetLoss &&
    jitter <= qualityThresholds.good.jitter
  ) {
    return 'good';
  }
  
  if (
    rtt <= qualityThresholds.fair.rtt &&
    packetLoss <= qualityThresholds.fair.packetLoss &&
    jitter <= qualityThresholds.fair.jitter
  ) {
    return 'fair';
  }
  
  return 'poor';
}

// Helper function to validate TURN server
function validateTurnServer() {
  if (!process.env.TURN_SERVER_URL) {
    console.warn('⚠️  TURN server not configured. Video calls may not work behind firewalls.');
    console.warn('   Please set TURN_SERVER_URL, TURN_USERNAME, and TURN_PASSWORD in .env');
    return false;
  }
  return true;
}

module.exports = {
  webrtcConfig,
  iceServers,
  stunServers,
  turnServers,
  mediaConstraints,
  screenShareConstraints,
  recordingConstraints,
  qualityThresholds,
  limits,
  getQualityLevel,
  validateTurnServer
};
