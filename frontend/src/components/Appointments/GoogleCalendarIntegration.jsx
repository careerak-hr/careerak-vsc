import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import './GoogleCalendarIntegration.css';

/**
 * GoogleCalendarIntegration - مكون إدارة تكامل Google Calendar
 * يتيح للمستخدم ربط/فصل Google Calendar ومزامنة المواعيد
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

const t = {
  ar: {
    title: 'Google Calendar',
    subtitle: 'زامن مواعيدك مع Google Calendar',
    connected: 'متصل',
    disconnected: 'غير متصل',
    connectedAs: 'متصل بـ',
    lastSync: 'آخر مزامنة',
    never: 'لم تتم بعد',
    connect: 'ربط Google Calendar',
    sync: 'مزامنة الآن',
    disconnect: 'إلغاء الربط',
    syncing: 'جاري المزامنة...',
    connecting: 'جاري الاتصال...',
    disconnecting: 'جاري إلغاء الربط...',
    loading: 'جاري التحميل...',
    syncSuccess: 'تمت المزامنة بنجاح',
    disconnectSuccess: 'تم إلغاء الربط بنجاح',
    connectError: 'فشل الاتصال بـ Google Calendar',
    syncError: 'فشل المزامنة',
    disconnectError: 'فشل إلغاء الربط',
    statusError: 'فشل تحميل حالة التكامل',
    benefits: 'فوائد الربط',
    benefit1: 'مزامنة تلقائية للمواعيد',
    benefit2: 'إنشاء أحداث في Google Calendar عند الحجز',
    benefit3: 'رابط Google Meet للمقابلات الافتراضية',
    benefit4: 'تحديث وحذف الأحداث تلقائياً',
  },
  en: {
    title: 'Google Calendar',
    subtitle: 'Sync your appointments with Google Calendar',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connectedAs: 'Connected as',
    lastSync: 'Last sync',
    never: 'Never',
    connect: 'Connect Google Calendar',
    sync: 'Sync Now',
    disconnect: 'Disconnect',
    syncing: 'Syncing...',
    connecting: 'Connecting...',
    disconnecting: 'Disconnecting...',
    loading: 'Loading...',
    syncSuccess: 'Synced successfully',
    disconnectSuccess: 'Disconnected successfully',
    connectError: 'Failed to connect Google Calendar',
    syncError: 'Sync failed',
    disconnectError: 'Disconnect failed',
    statusError: 'Failed to load integration status',
    benefits: 'Benefits',
    benefit1: 'Automatic appointment sync',
    benefit2: 'Create events in Google Calendar on booking',
    benefit3: 'Google Meet link for virtual interviews',
    benefit4: 'Auto update and delete events',
  },
  fr: {
    title: 'Google Calendar',
    subtitle: 'Synchronisez vos rendez-vous avec Google Calendar',
    connected: 'Connecté',
    disconnected: 'Déconnecté',
    connectedAs: 'Connecté en tant que',
    lastSync: 'Dernière sync',
    never: 'Jamais',
    connect: 'Connecter Google Calendar',
    sync: 'Synchroniser',
    disconnect: 'Déconnecter',
    syncing: 'Synchronisation...',
    connecting: 'Connexion...',
    disconnecting: 'Déconnexion...',
    loading: 'Chargement...',
    syncSuccess: 'Synchronisé avec succès',
    disconnectSuccess: 'Déconnecté avec succès',
    connectError: 'Échec de la connexion à Google Calendar',
    syncError: 'Échec de la synchronisation',
    disconnectError: 'Échec de la déconnexion',
    statusError: 'Échec du chargement du statut',
    benefits: 'Avantages',
    benefit1: 'Synchronisation automatique des rendez-vous',
    benefit2: 'Créer des événements lors de la réservation',
    benefit3: 'Lien Google Meet pour les entretiens virtuels',
    benefit4: 'Mise à jour et suppression automatiques',
  },
};

const GoogleCalendarIntegration = () => {
  const { language } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar'
    ? 'Amiri, Cairo, serif'
    : 'Cormorant Garamond, serif';

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/integrations/google/status');
      setStatus(res.data);
    } catch {
      showMessage(tr.statusError, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await api.get('/integrations/google/auth');
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch {
      showMessage(tr.connectError, 'error');
      setActionLoading(false);
    }
  };

  const handleSync = async () => {
    setActionLoading(true);
    try {
      await api.post('/integrations/google/sync');
      showMessage(tr.syncSuccess, 'success');
      await fetchStatus();
    } catch {
      showMessage(tr.syncError, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      await api.delete('/integrations/google/disconnect');
      showMessage(tr.disconnectSuccess, 'success');
      setStatus({ isConnected: false });
    } catch {
      showMessage(tr.disconnectError, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return tr.never;
    return new Date(d).toLocaleString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  if (loading) {
    return (
      <div className="gci-container" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <div className="gci-loading">{tr.loading}</div>
      </div>
    );
  }

  const isConnected = status?.isConnected;

  return (
    <div
      className={`gci-container${isRTL ? ' gci-rtl' : ' gci-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="gci-header">
        <div className="gci-logo">
          <svg viewBox="0 0 24 24" className="gci-google-icon" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div className="gci-header-text">
          <h3 className="gci-title">{tr.title}</h3>
          <p className="gci-subtitle">{tr.subtitle}</p>
        </div>
        <div className={`gci-status-badge gci-status-badge--${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="gci-status-dot" />
          {isConnected ? tr.connected : tr.disconnected}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`gci-message gci-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Connected Info */}
      {isConnected && (
        <div className="gci-info-card">
          {status.googleEmail && (
            <div className="gci-info-row">
              <span className="gci-info-icon">📧</span>
              <span className="gci-info-label">{tr.connectedAs}:</span>
              <span className="gci-info-value">{status.googleEmail}</span>
            </div>
          )}
          <div className="gci-info-row">
            <span className="gci-info-icon">🔄</span>
            <span className="gci-info-label">{tr.lastSync}:</span>
            <span className="gci-info-value">{formatDate(status.lastSyncAt)}</span>
          </div>
        </div>
      )}

      {/* Benefits (when disconnected) */}
      {!isConnected && (
        <div className="gci-benefits">
          <p className="gci-benefits-title">{tr.benefits}:</p>
          <ul className="gci-benefits-list">
            <li>✅ {tr.benefit1}</li>
            <li>✅ {tr.benefit2}</li>
            <li>✅ {tr.benefit3}</li>
            <li>✅ {tr.benefit4}</li>
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="gci-actions">
        {!isConnected ? (
          <button
            className="gci-btn gci-btn--connect"
            onClick={handleConnect}
            disabled={actionLoading}
          >
            {actionLoading ? tr.connecting : tr.connect}
          </button>
        ) : (
          <>
            <button
              className="gci-btn gci-btn--sync"
              onClick={handleSync}
              disabled={actionLoading}
            >
              {actionLoading ? tr.syncing : tr.sync}
            </button>
            <button
              className="gci-btn gci-btn--disconnect"
              onClick={handleDisconnect}
              disabled={actionLoading}
            >
              {actionLoading ? tr.disconnecting : tr.disconnect}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarIntegration;
