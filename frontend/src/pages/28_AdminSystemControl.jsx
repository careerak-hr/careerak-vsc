import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import InteractiveElement from '../components/InteractiveElement';
import './28_AdminSystemControl.css';

const AdminSystemControl = () => {
  const { language, user, startBgMusic } = useApp();
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState({
    nodeVersion: 'N/A',
    reactVersion: 'N/A',
    capacitorVersion: 'N/A',
    platform: 'N/A',
    memory: 'N/A',
    uptime: 'N/A'
  });
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  // Tab navigation order
  const tabs = ['info', 'actions', 'logs'];

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e) => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }

    if (newIndex !== currentIndex) {
      setActiveTab(tabs[newIndex]);
      // Focus the new tab
      setTimeout(() => {
        document.getElementById(`${tabs[newIndex]}-tab`)?.focus();
      }, 0);
    }
  };

  // تشغيل الموسيقى عند فتح الصفحة
  useEffect(() => {
    if (startBgMusic) startBgMusic();
    loadSystemInfo();
    loadLogs();
  }, [startBgMusic]);

  const loadSystemInfo = () => {
    // معلومات النظام من المتصفح
    setSystemInfo({
      nodeVersion: import.meta.env.VITE_NODE_VERSION || 'N/A',
      reactVersion: React.version,
      capacitorVersion: '5.x',
      platform: navigator.platform,
      memory: `${(performance.memory?.usedJSHeapSize / 1048576).toFixed(2)} MB` || 'N/A',
      uptime: `${Math.floor(performance.now() / 1000 / 60)} minutes`
    });
  };

  const loadLogs = () => {
    // جلب السجلات من localStorage
    const storedLogs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storedLogs.push({
          key,
          value: localStorage.getItem(key)
        });
      }
    }
    setLogs(storedLogs);
  };

  const clearCache = () => {
    if (window.confirm(language === 'ar' ? 'هل تريد مسح الذاكرة المؤقتة؟' : 'Clear cache?')) {
      // مسح الذاكرة المؤقتة
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      alert(language === 'ar' ? 'تم مسح الذاكرة المؤقتة' : 'Cache cleared');
    }
  };

  const clearLocalStorage = () => {
    if (window.confirm(language === 'ar' ? 'هل تريد مسح جميع البيانات المحلية؟ (سيتم تسجيل الخروج)' : 'Clear all local data? (You will be logged out)')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/language';
    }
  };

  const reloadApp = () => {
    window.location.reload();
  };

  const exportLogs = () => {
    const logsText = logs.map(log => `${log.key}: ${log.value}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careerak-logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  const renderInfoTab = () => (
    <div className="asc-tab-content" role="tabpanel" id="info-panel" aria-labelledby="info-tab">
      <h2 className="asc-section-title">
        {language === 'ar' ? '📊 معلومات النظام' : 'System Information'}
      </h2>
      <div className="asc-info-grid">
        <div className="asc-info-card">
          <div className="asc-info-label">React Version</div>
          <div className="asc-info-value">{systemInfo.reactVersion}</div>
        </div>
        <div className="asc-info-card">
          <div className="asc-info-label">Capacitor</div>
          <div className="asc-info-value">{systemInfo.capacitorVersion}</div>
        </div>
        <div className="asc-info-card">
          <div className="asc-info-label">Platform</div>
          <div className="asc-info-value">{systemInfo.platform}</div>
        </div>
        <div className="asc-info-card">
          <div className="asc-info-label">Memory Usage</div>
          <div className="asc-info-value">{systemInfo.memory}</div>
        </div>
        <div className="asc-info-card">
          <div className="asc-info-label">Uptime</div>
          <div className="asc-info-value">{systemInfo.uptime}</div>
        </div>
        <div className="asc-info-card">
          <div className="asc-info-label">User Agent</div>
          <div className="asc-info-value" style={{ fontSize: '0.8rem' }}>
            {navigator.userAgent.substring(0, 50)}...
          </div>
        </div>
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="asc-tab-content" role="tabpanel" id="actions-panel" aria-labelledby="actions-tab">
      <h2 className="asc-section-title">
        {language === 'ar' ? '⚡ إجراءات النظام' : 'System Actions'}
      </h2>
      <div className="asc-actions-grid">
        <InteractiveElement as="button" variant="secondary" onClick={reloadApp} className="asc-action-btn reload" aria-label={language === 'ar' ? 'إعادة تحميل التطبيق' : 'Reload App'}>
          🔄 {language === 'ar' ? 'إعادة تحميل التطبيق' : 'Reload App'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={clearCache} className="asc-action-btn cache" aria-label={language === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}>
          🗑️ {language === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="danger" onClick={clearLocalStorage} className="asc-action-btn danger" aria-label={language === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}>
          ⚠️ {language === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={loadLogs} className="asc-action-btn info" aria-label={language === 'ar' ? 'تحديث السجلات' : 'Refresh Logs'}>
          📋 {language === 'ar' ? 'تحديث السجلات' : 'Refresh Logs'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={exportLogs} className="asc-action-btn export" aria-label={language === 'ar' ? 'تصدير السجلات' : 'Export Logs'}>
          💾 {language === 'ar' ? 'تصدير السجلات' : 'Export Logs'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={() => navigate('/admin-database')} className="asc-action-btn database" aria-label={language === 'ar' ? 'إدارة قاعدة البيانات' : 'Database Manager'}>
          🗄️ {language === 'ar' ? 'إدارة قاعدة البيانات' : 'Database Manager'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={() => navigate('/admin-code-editor')} className="asc-action-btn code" aria-label={language === 'ar' ? 'محرر الأكواد' : 'Code Editor'}>
          💻 {language === 'ar' ? 'محرر الأكواد' : 'Code Editor'}
        </InteractiveElement>
        <InteractiveElement as="button" variant="secondary" onClick={() => navigate('/admin-pages')} className="asc-action-btn pages" aria-label={language === 'ar' ? 'متصفح الصفحات' : 'Pages Navigator'}>
          🗺️ {language === 'ar' ? 'متصفح الصفحات' : 'Pages Navigator'}
        </InteractiveElement>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="asc-tab-content" role="tabpanel" id="logs-panel" aria-labelledby="logs-tab">
      <h2 className="asc-section-title">
        {language === 'ar' ? '📝 سجلات LocalStorage' : 'LocalStorage Logs'}
      </h2>
      <div className="asc-logs-container">
        {logs.length === 0 ? (
          <p className="asc-no-logs">
            {language === 'ar' ? 'لا توجد سجلات' : 'No logs found'}
          </p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="asc-log-item">
              <div className="asc-log-key">{log.key}</div>
              <div className="asc-log-value">{log.value}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <main id="main-content" tabIndex="-1" className="admin-system-control">
      <div className="asc-header">
        <button onClick={() => navigate('/admin-dashboard')} className="asc-back-btn">
          ← {language === 'ar' ? 'العودة' : 'Back'}
        </button>
        <h1 className="asc-title">
          {language === 'ar' ? '🖥️ التحكم بالنظام' : '🖥️ System Control'}
        </h1>
      </div>

      <div className="asc-tabs" role="tablist">
        <InteractiveElement
          as="button"
          variant="subtle"
          onClick={() => setActiveTab('info')}
          onKeyDown={handleTabKeyDown}
          className={`asc-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'info'}
          aria-controls="info-panel"
          id="info-tab"
          tabIndex={activeTab === 'info' ? 0 : -1}
        >
          📊 {language === 'ar' ? 'المعلومات' : 'Info'}
        </InteractiveElement>
        <InteractiveElement
          as="button"
          variant="subtle"
          onClick={() => setActiveTab('actions')}
          onKeyDown={handleTabKeyDown}
          className={`asc-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'actions'}
          aria-controls="actions-panel"
          id="actions-tab"
          tabIndex={activeTab === 'actions' ? 0 : -1}
        >
          ⚡ {language === 'ar' ? 'الإجراءات' : 'Actions'}
        </InteractiveElement>
        <InteractiveElement
          as="button"
          variant="subtle"
          onClick={() => setActiveTab('logs')}
          onKeyDown={handleTabKeyDown}
          className={`asc-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'logs'}
          aria-controls="logs-panel"
          id="logs-tab"
          tabIndex={activeTab === 'logs' ? 0 : -1}
        >
          📝 {language === 'ar' ? 'السجلات' : 'Logs'}
        </InteractiveElement>
      </div>

      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'actions' && renderActionsTab()}
      {activeTab === 'logs' && renderLogsTab()}
    </main>
  );
};

export default AdminSystemControl;
