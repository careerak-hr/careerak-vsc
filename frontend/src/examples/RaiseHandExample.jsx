import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RaiseHand from '../components/VideoInterview/RaiseHand';
import { useApp } from '../context/AppContext';

/**
 * مثال على استخدام مكون RaiseHand
 * 
 * هذا المثال يوضح:
 * 1. كيفية إعداد Socket.IO
 * 2. كيفية استخدام مكون RaiseHand
 * 3. كيفية التعامل مع الأحداث
 */

const RaiseHandExample = () => {
  const { language } = useApp();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomId] = useState('demo-room-123');
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [userName, setUserName] = useState('مستخدم تجريبي');

  // الترجمات
  const translations = {
    ar: {
      title: 'مثال على ميزة رفع اليد',
      description: 'هذا مثال تفاعلي يوضح كيفية استخدام ميزة رفع اليد في مقابلات الفيديو',
      connect: 'اتصال',
      disconnect: 'قطع الاتصال',
      connected: 'متصل',
      disconnected: 'غير متصل',
      status: 'الحالة',
      role: 'الدور',
      host: 'مضيف',
      participant: 'مشارك',
      switchRole: 'تبديل الدور',
      yourName: 'اسمك',
      roomId: 'معرف الغرفة',
      userId: 'معرف المستخدم',
      instructions: 'التعليمات',
      step1: '1. اضغط على "اتصال" للانضمام للغرفة',
      step2: '2. اضغط على زر رفع اليد (✋) لرفع يدك',
      step3: '3. إذا كنت مضيفاً، ستظهر لك قائمة بجميع الأيدي المرفوعة',
      step4: '4. اضغط مرة أخرى لخفض يدك',
      step5: '5. جرب تبديل الدور لرؤية الفرق بين المضيف والمشارك',
      notes: 'ملاحظات',
      note1: '• المضيف يرى قائمة كاملة بالأيدي المرفوعة',
      note2: '• المشارك يرى فقط عدد الأيدي المرفوعة',
      note3: '• يمكن رفع وخفض اليد في أي وقت',
      note4: '• عند مغادرة المستخدم، تُزال يده تلقائياً',
    },
    en: {
      title: 'Raise Hand Feature Example',
      description: 'This is an interactive example showing how to use the raise hand feature in video interviews',
      connect: 'Connect',
      disconnect: 'Disconnect',
      connected: 'Connected',
      disconnected: 'Disconnected',
      status: 'Status',
      role: 'Role',
      host: 'Host',
      participant: 'Participant',
      switchRole: 'Switch Role',
      yourName: 'Your Name',
      roomId: 'Room ID',
      userId: 'User ID',
      instructions: 'Instructions',
      step1: '1. Click "Connect" to join the room',
      step2: '2. Click the raise hand button (✋) to raise your hand',
      step3: '3. If you are a host, you will see a list of all raised hands',
      step4: '4. Click again to lower your hand',
      step5: '5. Try switching roles to see the difference between host and participant',
      notes: 'Notes',
      note1: '• Host sees a complete list of raised hands',
      note2: '• Participant only sees the count of raised hands',
      note3: '• You can raise and lower your hand at any time',
      note4: '• When a user leaves, their hand is automatically removed',
    },
    fr: {
      title: 'Exemple de la fonctionnalité Lever la main',
      description: 'Ceci est un exemple interactif montrant comment utiliser la fonctionnalité de lever la main dans les entretiens vidéo',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      connected: 'Connecté',
      disconnected: 'Déconnecté',
      status: 'Statut',
      role: 'Rôle',
      host: 'Hôte',
      participant: 'Participant',
      switchRole: 'Changer de rôle',
      yourName: 'Votre nom',
      roomId: 'ID de la salle',
      userId: 'ID utilisateur',
      instructions: 'Instructions',
      step1: '1. Cliquez sur "Connecter" pour rejoindre la salle',
      step2: '2. Cliquez sur le bouton lever la main (✋) pour lever votre main',
      step3: '3. Si vous êtes un hôte, vous verrez une liste de toutes les mains levées',
      step4: '4. Cliquez à nouveau pour baisser votre main',
      step5: '5. Essayez de changer de rôle pour voir la différence entre hôte et participant',
      notes: 'Notes',
      note1: "• L'hôte voit une liste complète des mains levées",
      note2: '• Le participant ne voit que le nombre de mains levées',
      note3: '• Vous pouvez lever et baisser votre main à tout moment',
      note4: "• Lorsqu'un utilisateur part, sa main est automatiquement retirée",
    },
  };

  const t = translations[language] || translations.ar;

  // إعداد Socket.IO
  useEffect(() => {
    if (isConnected && !socket) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        
        // الانضمام للغرفة
        newSocket.emit('join-room', {
          roomId,
          userId,
          userName,
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isConnected, socket, roomId, userId, userName]);

  // الاتصال/قطع الاتصال
  const handleToggleConnection = () => {
    if (isConnected) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
    } else {
      setIsConnected(true);
    }
  };

  // تبديل الدور
  const handleToggleRole = () => {
    setIsHost(!isHost);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.description}>{t.description}</p>
      </div>

      <div style={styles.content}>
        {/* لوحة التحكم */}
        <div style={styles.controlPanel}>
          <h2 style={styles.sectionTitle}>{t.instructions}</h2>
          
          {/* معلومات الاتصال */}
          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <label style={styles.label}>{t.status}:</label>
              <span style={{
                ...styles.status,
                color: isConnected ? '#4caf50' : '#f44336',
              }}>
                {isConnected ? t.connected : t.disconnected}
              </span>
            </div>

            <div style={styles.infoItem}>
              <label style={styles.label}>{t.role}:</label>
              <span style={styles.value}>
                {isHost ? t.host : t.participant}
              </span>
            </div>

            <div style={styles.infoItem}>
              <label style={styles.label}>{t.yourName}:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={styles.input}
                disabled={isConnected}
              />
            </div>

            <div style={styles.infoItem}>
              <label style={styles.label}>{t.roomId}:</label>
              <span style={styles.value}>{roomId}</span>
            </div>

            <div style={styles.infoItem}>
              <label style={styles.label}>{t.userId}:</label>
              <span style={styles.value}>{userId}</span>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div style={styles.buttonGroup}>
            <button
              onClick={handleToggleConnection}
              style={{
                ...styles.button,
                backgroundColor: isConnected ? '#f44336' : '#4caf50',
              }}
            >
              {isConnected ? t.disconnect : t.connect}
            </button>

            <button
              onClick={handleToggleRole}
              style={styles.button}
              disabled={!isConnected}
            >
              {t.switchRole}
            </button>
          </div>

          {/* التعليمات */}
          <div style={styles.instructions}>
            <p style={styles.step}>{t.step1}</p>
            <p style={styles.step}>{t.step2}</p>
            <p style={styles.step}>{t.step3}</p>
            <p style={styles.step}>{t.step4}</p>
            <p style={styles.step}>{t.step5}</p>
          </div>

          {/* ملاحظات */}
          <div style={styles.notes}>
            <h3 style={styles.notesTitle}>{t.notes}</h3>
            <p style={styles.note}>{t.note1}</p>
            <p style={styles.note}>{t.note2}</p>
            <p style={styles.note}>{t.note3}</p>
            <p style={styles.note}>{t.note4}</p>
          </div>
        </div>

        {/* منطقة العرض */}
        <div style={styles.demoArea}>
          <div style={styles.videoPlaceholder}>
            <p style={styles.placeholderText}>
              {isConnected ? '📹 Video Call Area' : '⏸️ Not Connected'}
            </p>
          </div>

          {/* مكون RaiseHand */}
          <div style={styles.raiseHandContainer}>
            {isConnected && socket ? (
              <RaiseHand
                socket={socket}
                roomId={roomId}
                isHost={isHost}
                currentUserId={userId}
                currentUserName={userName}
              />
            ) : (
              <div style={styles.notConnectedMessage}>
                {t.connect}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// التنسيقات
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Amiri, Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    color: '#304B60',
    marginBottom: '10px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  controlPanel: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #D4816180',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#304B60',
    marginBottom: '15px',
  },
  infoGroup: {
    marginBottom: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  label: {
    fontWeight: 'bold',
    color: '#304B60',
    minWidth: '120px',
  },
  value: {
    color: '#666',
  },
  status: {
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '2px solid #D4816180',
    borderRadius: '8px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    flex: 1,
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  instructions: {
    background: '#E3DAD1',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  step: {
    fontSize: '14px',
    color: '#304B60',
    marginBottom: '8px',
  },
  notes: {
    background: '#f8f8f8',
    padding: '15px',
    borderRadius: '8px',
  },
  notesTitle: {
    fontSize: '16px',
    color: '#304B60',
    marginBottom: '10px',
  },
  note: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '5px',
  },
  demoArea: {
    position: 'relative',
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #D4816180',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  videoPlaceholder: {
    width: '100%',
    height: '400px',
    background: '#000',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  placeholderText: {
    color: '#fff',
    fontSize: '24px',
  },
  raiseHandContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60px',
  },
  notConnectedMessage: {
    color: '#999',
    fontSize: '16px',
  },
};

export default RaiseHandExample;
