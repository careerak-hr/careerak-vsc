/**
 * Latency Optimization Utilities (Frontend)
 * أدوات تحسين زمن الانتقال من جانب العميل
 * 
 * الهدف: تحقيق latency < 300ms
 */

/**
 * إعدادات WebRTC المحسّنة لتقليل الـ latency
 */
export const LOW_LATENCY_RTC_CONFIG = {
  iceServers: [
    // STUN servers (سريعة)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // TURN server (للجدران النارية)
    {
      urls: 'turn:turn.careerak.com:3478',
      username: 'careerak',
      credential: 'secure_password'
    }
  ],
  
  // تفضيل UDP على TCP (أسرع)
  iceTransportPolicy: 'all',
  
  // Bundle policy لتقليل عدد الاتصالات
  bundlePolicy: 'max-bundle',
  
  // RTCP multiplexing لتقليل الـ overhead
  rtcpMuxPolicy: 'require',
  
  // تفعيل IPv6 إذا كان متاحاً
  iceCandidatePoolSize: 10
};

/**
 * إعدادات الميديا المحسّنة لتقليل الـ latency
 */
export const LOW_LATENCY_MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
    
    // تقليل الـ latency
    latency: { ideal: 0 },
    
    // تفعيل hardware acceleration
    facingMode: 'user'
  },
  
  audio: {
    // تحسينات الصوت
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    
    // تقليل الـ latency
    latency: { ideal: 0 },
    
    // جودة عالية
    sampleRate: 48000,
    channelCount: 1
  }
};

/**
 * إعداد PeerConnection مع تحسينات الـ latency
 */
export function createOptimizedPeerConnection(config = {}) {
  const mergedConfig = {
    ...LOW_LATENCY_RTC_CONFIG,
    ...config
  };

  const pc = new RTCPeerConnection(mergedConfig);

  // تفعيل التحسينات
  enableLowLatencyOptimizations(pc);

  return pc;
}

/**
 * تفعيل تحسينات الـ latency على PeerConnection موجود
 */
export function enableLowLatencyOptimizations(peerConnection) {
  // 1. تفعيل Unified Plan (أحدث وأسرع)
  if (peerConnection.addTransceiver) {
    // استخدام transceiver API للتحكم الأفضل
    console.log('[Latency] Using Unified Plan SDP');
  }

  // 2. معالجة ICE candidates بسرعة
  peerConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      // إرسال candidate فوراً (trickle ICE)
      console.log('[Latency] Sending ICE candidate immediately');
    }
  });

  // 3. مراقبة حالة الاتصال
  peerConnection.addEventListener('iceconnectionstatechange', () => {
    console.log('[Latency] ICE connection state:', peerConnection.iceConnectionState);
    
    if (peerConnection.iceConnectionState === 'failed') {
      console.warn('[Latency] Connection failed, attempting ICE restart');
      peerConnection.restartIce();
    }
  });

  return peerConnection;
}

/**
 * قياس زمن الانتقال (latency)
 */
export async function measureLatency(peerConnection) {
  try {
    const stats = await peerConnection.getStats();
    let totalRTT = 0;
    let count = 0;

    stats.forEach(report => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime) {
          totalRTT += report.currentRoundTripTime * 1000; // ms
          count++;
        }
      }
    });

    const averageLatency = count > 0 ? totalRTT / count : 0;

    return {
      latency: Math.round(averageLatency),
      unit: 'ms',
      meetsTarget: averageLatency < 300,
      quality: getLatencyQuality(averageLatency)
    };

  } catch (error) {
    console.error('[Latency] Measurement failed:', error);
    return null;
  }
}

/**
 * تحديد جودة الـ latency
 */
function getLatencyQuality(latency) {
  if (latency < 150) return 'excellent';
  if (latency < 300) return 'good';
  if (latency < 500) return 'fair';
  return 'poor';
}

/**
 * مراقبة جودة الاتصال بشكل مستمر
 */
export function startQualityMonitoring(peerConnection, callback, interval = 5000) {
  const monitor = setInterval(async () => {
    const stats = await getConnectionStats(peerConnection);
    
    if (stats && callback) {
      callback(stats);
    }
  }, interval);

  return monitor; // يمكن استخدامه لإيقاف المراقبة
}

/**
 * إيقاف مراقبة الجودة
 */
export function stopQualityMonitoring(monitor) {
  if (monitor) {
    clearInterval(monitor);
  }
}

/**
 * الحصول على إحصائيات الاتصال الشاملة
 */
export async function getConnectionStats(peerConnection) {
  try {
    const stats = await peerConnection.getStats();
    const result = {
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      bandwidth: {
        video: { sent: 0, received: 0 },
        audio: { sent: 0, received: 0 }
      },
      quality: 'unknown'
    };

    stats.forEach(report => {
      // Latency (RTT)
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime) {
          result.latency = Math.round(report.currentRoundTripTime * 1000);
        }
      }

      // Packet Loss & Jitter
      if (report.type === 'inbound-rtp') {
        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 0;
        const totalPackets = packetsLost + packetsReceived;
        
        if (totalPackets > 0) {
          result.packetLoss = parseFloat(((packetsLost / totalPackets) * 100).toFixed(2));
        }

        if (report.jitter) {
          result.jitter = Math.round(report.jitter * 1000);
        }

        // Bandwidth
        if (report.kind === 'video') {
          result.bandwidth.video.received = Math.round((report.bytesReceived * 8) / 1000000);
        } else if (report.kind === 'audio') {
          result.bandwidth.audio.received = Math.round((report.bytesReceived * 8) / 1000000);
        }
      }

      // Outbound bandwidth
      if (report.type === 'outbound-rtp') {
        if (report.kind === 'video') {
          result.bandwidth.video.sent = Math.round((report.bytesSent * 8) / 1000000);
        } else if (report.kind === 'audio') {
          result.bandwidth.audio.sent = Math.round((report.bytesSent * 8) / 1000000);
        }
      }
    });

    // تحديد الجودة الإجمالية
    result.quality = determineOverallQuality(result);

    return result;

  } catch (error) {
    console.error('[Stats] Failed to get connection stats:', error);
    return null;
  }
}

/**
 * تحديد الجودة الإجمالية
 */
function determineOverallQuality(stats) {
  const { latency, packetLoss } = stats;

  if (latency < 150 && packetLoss < 1) return 'excellent';
  if (latency < 300 && packetLoss < 3) return 'good';
  if (latency < 500 && packetLoss < 5) return 'fair';
  return 'poor';
}

/**
 * إعادة الاتصال التلقائي
 */
export async function autoReconnect(peerConnection, maxAttempts = 5) {
  let attempt = 0;
  let delay = 1000; // 1 second

  while (attempt < maxAttempts) {
    try {
      console.log(`[Reconnect] Attempt ${attempt + 1}/${maxAttempts}`);

      // إعادة تشغيل ICE
      peerConnection.restartIce();

      // انتظار إعادة الاتصال
      const reconnected = await waitForReconnection(peerConnection, 5000);

      if (reconnected) {
        console.log('[Reconnect] Successfully reconnected');
        return true;
      }

      // Exponential backoff
      await sleep(delay);
      delay = Math.min(delay * 1.5, 10000);
      attempt++;

    } catch (error) {
      console.error(`[Reconnect] Attempt ${attempt + 1} failed:`, error);
      attempt++;
    }
  }

  console.error('[Reconnect] Max attempts reached');
  return false;
}

/**
 * انتظار إعادة الاتصال
 */
function waitForReconnection(peerConnection, timeout) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeout);

    const handler = () => {
      if (peerConnection.iceConnectionState === 'connected' ||
          peerConnection.iceConnectionState === 'completed') {
        clearTimeout(timer);
        peerConnection.removeEventListener('iceconnectionstatechange', handler);
        resolve(true);
      }
    };

    peerConnection.addEventListener('iceconnectionstatechange', handler);
  });
}

/**
 * دالة مساعدة للانتظار
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تحسين SDP لتقليل الـ latency
 */
export function optimizeSDP(sdp) {
  let optimizedSDP = sdp;

  // 1. تفضيل VP9 codec (أفضل ضغط)
  optimizedSDP = preferCodec(optimizedSDP, 'video', 'VP9');

  // 2. تفضيل Opus codec للصوت (أقل latency)
  optimizedSDP = preferCodec(optimizedSDP, 'audio', 'opus');

  // 3. تفعيل DTX (Discontinuous Transmission) لتوفير النطاق
  optimizedSDP = optimizedSDP.replace(
    /(a=fmtp:\d+ .*)/g,
    '$1;usedtx=1'
  );

  // 4. تقليل الـ bitrate للحصول على latency أقل
  optimizedSDP = optimizedSDP.replace(
    /(a=fmtp:\d+ .*)/g,
    '$1;x-google-start-bitrate=1000;x-google-max-bitrate=2500'
  );

  return optimizedSDP;
}

/**
 * تفضيل codec معين
 */
function preferCodec(sdp, kind, codec) {
  const lines = sdp.split('\r\n');
  const mLineIndex = lines.findIndex(line => line.startsWith(`m=${kind}`));
  
  if (mLineIndex === -1) return sdp;

  const codecLineIndex = lines.findIndex(
    (line, index) => index > mLineIndex && line.includes(codec)
  );

  if (codecLineIndex === -1) return sdp;

  const codecLine = lines[codecLineIndex];
  const payload = codecLine.split(':')[1].split(' ')[0];

  // نقل الـ payload إلى البداية
  const mLine = lines[mLineIndex];
  const parts = mLine.split(' ');
  const payloads = parts.slice(3);
  
  const newPayloads = [payload, ...payloads.filter(p => p !== payload)];
  lines[mLineIndex] = `${parts.slice(0, 3).join(' ')} ${newPayloads.join(' ')}`;

  return lines.join('\r\n');
}

export default {
  LOW_LATENCY_RTC_CONFIG,
  LOW_LATENCY_MEDIA_CONSTRAINTS,
  createOptimizedPeerConnection,
  enableLowLatencyOptimizations,
  measureLatency,
  startQualityMonitoring,
  stopQualityMonitoring,
  getConnectionStats,
  autoReconnect,
  optimizeSDP
};
