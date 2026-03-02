/**
 * WebRTC Service
 * إدارة اتصالات WebRTC مع دعم جودة HD (720p+)
 */

class WebRTCService {
  constructor() {
    // إعدادات جودة الفيديو HD (720p على الأقل)
    this.videoConstraints = {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      }
    };

    // إعدادات ICE servers
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: process.env.TURN_SERVER_URL || 'turn:turn.careerak.com:3478',
        username: process.env.TURN_USERNAME || 'careerak',
        credential: process.env.TURN_CREDENTIAL || 'secure_password'
      }
    ];

    // تكوين RTCPeerConnection
    this.peerConnectionConfig = {
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    // تخزين الاتصالات النشطة
    this.activePeerConnections = new Map();
  }

  /**
   * إنشاء peer connection جديد
   * @param {string} connectionId - معرف الاتصال الفريد
   * @param {Function} onTrack - callback عند استقبال track
   * @param {Function} onICECandidate - callback عند توليد ICE candidate
   * @returns {RTCPeerConnection}
   */
  createPeerConnection(connectionId, onTrack, onICECandidate) {
    try {
      const peerConnection = new RTCPeerConnection(this.peerConnectionConfig);

      // تخزين الاتصال
      this.activePeerConnections.set(connectionId, peerConnection);

      // معالجة ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && onICECandidate) {
          onICECandidate(event.candidate);
        }
      };

      // معالجة تغيير حالة الاتصال
      peerConnection.onconnectionstatechange = () => {
        this.handleConnectionStateChange(connectionId, peerConnection.connectionState);
      };

      // معالجة تغيير حالة ICE
      peerConnection.oniceconnectionstatechange = () => {
        this.handleICEConnectionStateChange(connectionId, peerConnection.iceConnectionState);
      };

      // معالجة استقبال media tracks
      peerConnection.ontrack = (event) => {
        if (onTrack) {
          onTrack(event);
        }
        this.handleTrack(connectionId, event);
      };

      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw new Error('Failed to create peer connection');
    }
  }

  /**
   * الحصول على media stream مع جودة HD
   * @param {Object} constraints - قيود إضافية (اختياري)
   * @returns {Promise<MediaStream>}
   */
  async getUserMedia(constraints = {}) {
    try {
      // دمج القيود الافتراضية مع القيود المخصصة
      const finalConstraints = {
        video: { ...this.videoConstraints.video, ...constraints.video },
        audio: { ...this.videoConstraints.audio, ...constraints.audio }
      };

      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);

      // التحقق من جودة الفيديو
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('Video quality:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate
        });

        // التحقق من أن الجودة HD على الأقل (720p)
        if (settings.height < 720) {
          console.warn('Video quality is below HD (720p):', settings.height);
        }
      }

      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * إضافة media stream إلى peer connection
   * @param {string} connectionId - معرف الاتصال
   * @param {MediaStream} stream - media stream
   */
  addStreamToPeerConnection(connectionId, stream) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
  }

  /**
   * إنشاء SDP offer
   * @param {string} connectionId - معرف الاتصال
   * @returns {Promise<RTCSessionDescriptionInit>}
   */
  async createOffer(connectionId) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw new Error('Failed to create offer');
    }
  }

  /**
   * إنشاء SDP answer
   * @param {string} connectionId - معرف الاتصال
   * @returns {Promise<RTCSessionDescriptionInit>}
   */
  async createAnswer(connectionId) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw new Error('Failed to create answer');
    }
  }

  /**
   * معالجة SDP offer
   * @param {string} connectionId - معرف الاتصال
   * @param {RTCSessionDescriptionInit} offer - SDP offer
   */
  async handleOffer(connectionId, offer) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    } catch (error) {
      console.error('Error handling offer:', error);
      throw new Error('Failed to handle offer');
    }
  }

  /**
   * معالجة SDP answer
   * @param {string} connectionId - معرف الاتصال
   * @param {RTCSessionDescriptionInit} answer - SDP answer
   */
  async handleAnswer(connectionId, answer) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw new Error('Failed to handle answer');
    }
  }

  /**
   * معالجة ICE candidate
   * @param {string} connectionId - معرف الاتصال
   * @param {RTCIceCandidate} candidate - ICE candidate
   */
  async handleICECandidate(connectionId, candidate) {
    // يتم إرسال ICE candidate عبر signaling server
    // سيتم تنفيذ هذا في SignalingService
    console.log('ICE candidate for connection:', connectionId, candidate);
  }

  /**
   * إضافة ICE candidate من الطرف الآخر
   * @param {string} connectionId - معرف الاتصال
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   */
  async addICECandidate(connectionId, candidate) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      throw new Error('Failed to add ICE candidate');
    }
  }

  /**
   * معالجة تغيير حالة الاتصال
   * @param {string} connectionId - معرف الاتصال
   * @param {string} state - حالة الاتصال
   */
  handleConnectionStateChange(connectionId, state) {
    console.log(`Connection ${connectionId} state changed to:`, state);

    switch (state) {
      case 'connected':
        console.log('Peer connection established successfully');
        break;
      case 'disconnected':
        console.warn('Peer connection disconnected');
        break;
      case 'failed':
        console.error('Peer connection failed');
        this.closePeerConnection(connectionId);
        break;
      case 'closed':
        console.log('Peer connection closed');
        this.activePeerConnections.delete(connectionId);
        break;
    }
  }

  /**
   * معالجة تغيير حالة ICE
   * @param {string} connectionId - معرف الاتصال
   * @param {string} state - حالة ICE
   */
  handleICEConnectionStateChange(connectionId, state) {
    console.log(`ICE connection ${connectionId} state changed to:`, state);
  }

  /**
   * معالجة استقبال media track
   * @param {string} connectionId - معرف الاتصال
   * @param {RTCTrackEvent} event - track event
   */
  handleTrack(connectionId, event) {
    console.log('Received track for connection:', connectionId, event.track.kind);
    // سيتم معالجة هذا في VideoCall Component
  }

  /**
   * إغلاق peer connection
   * @param {string} connectionId - معرف الاتصال
   */
  closePeerConnection(connectionId) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (peerConnection) {
      peerConnection.close();
      this.activePeerConnections.delete(connectionId);
    }
  }

  /**
   * الحصول على إحصائيات الاتصال
   * @param {string} connectionId - معرف الاتصال
   * @returns {Promise<Object>}
   */
  async getConnectionStats(connectionId) {
    const peerConnection = this.activePeerConnections.get(connectionId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }

    try {
      const stats = await peerConnection.getStats();
      const statsReport = {};

      stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          statsReport.video = {
            bytesReceived: report.bytesReceived,
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            frameWidth: report.frameWidth,
            frameHeight: report.frameHeight,
            framesPerSecond: report.framesPerSecond
          };
        }
      });

      return statsReport;
    } catch (error) {
      console.error('Error getting connection stats:', error);
      throw new Error('Failed to get connection stats');
    }
  }

  /**
   * تبديل الكاميرا (أمامية/خلفية) - للموبايل
   * @param {MediaStream} stream - media stream الحالي
   * @returns {Promise<MediaStream>}
   */
  async switchCamera(stream) {
    try {
      // إيقاف الكاميرا الحالية
      stream.getVideoTracks().forEach(track => track.stop());

      // الحصول على الكاميرا الأخرى
      const currentFacingMode = stream.getVideoTracks()[0].getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await this.getUserMedia({
        video: { facingMode: newFacingMode }
      });

      return newStream;
    } catch (error) {
      console.error('Error switching camera:', error);
      throw new Error('Failed to switch camera');
    }
  }

  /**
   * الحصول على جميع الاتصالات النشطة
   * @returns {Map}
   */
  getAllPeerConnections() {
    return this.activePeerConnections;
  }

  /**
   * الحصول على عدد الاتصالات النشطة
   * @returns {number}
   */
  getActivePeerConnectionsCount() {
    return this.activePeerConnections.size;
  }

  /**
   * إغلاق جميع الاتصالات
   */
  closeAllPeerConnections() {
    this.activePeerConnections.forEach((peerConnection, connectionId) => {
      peerConnection.close();
    });
    this.activePeerConnections.clear();
  }

  /**
   * استبدال track في جميع الاتصالات
   * @param {MediaStreamTrack} oldTrack - track القديم
   * @param {MediaStreamTrack} newTrack - track الجديد
   */
  async replaceTrackInAllConnections(oldTrack, newTrack) {
    const promises = [];

    this.activePeerConnections.forEach((peerConnection) => {
      const sender = peerConnection.getSenders().find(s => s.track === oldTrack);
      if (sender) {
        promises.push(sender.replaceTrack(newTrack));
      }
    });

    await Promise.all(promises);
  }
}

module.exports = WebRTCService;
