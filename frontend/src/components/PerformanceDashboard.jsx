import React, { useState, useEffect } from 'react';
import './PerformanceDashboard.css';

// تحميل monitoring بشكل آمن
let getPerformanceReport = null;
try {
  getPerformanceReport = require('../utils/monitoring').getPerformanceReport;
} catch (error) {
  console.warn('Performance monitoring not available');
  getPerformanceReport = () => ({
    session: { duration: 0 },
    metrics: {},
    errors: { count: 0, recent: [], critical: [] },
    userActions: { count: 0, recent: [] },
    apiCalls: { count: 0, averageTime: 0, errorRate: 0, slowCalls: [] },
    memory: null,
    connection: null
  });
}

const PerformanceDashboard = ({ isVisible, onClose }) => {
  const [report, setReport] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (isVisible) {
      updateReport();
      const interval = setInterval(updateReport, 5000);
      setRefreshInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isVisible, refreshInterval]);

  const updateReport = () => {
    try {
      const newReport = getPerformanceReport();
      setReport(newReport);
    } catch (error) {
      console.error('Error getting performance report:', error);
    }
  };

  if (!isVisible || !report) return null;

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getMetricColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-success';
    if (value <= thresholds.needs_improvement) return 'text-accent'; // Changed to accent
    return 'text-danger';
  };

  return (
    <div className="performance-dashboard-backdrop">
      <div className="performance-dashboard-container">
        <div className="performance-dashboard-header">
          <h2 className="performance-dashboard-title">📊 لوحة مراقبة الأداء</h2>
          <button
            onClick={onClose}
            className="performance-dashboard-close-btn"
          >
            ×
          </button>
        </div>

        <div className="performance-dashboard-body">
          <div className="performance-dashboard-section">
            <h3 className="performance-dashboard-section-title">📱 معلومات الجلسة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">مدة الجلسة:</span> {formatDuration(report.session.duration)}
              </div>
              <div>
                <span className="font-semibold">الصفحة الحالية:</span> {window.location.pathname}
              </div>
            </div>
          </div>

          {Object.keys(report.metrics).length > 0 && (
            <div className="performance-dashboard-section">
              <h3 className="performance-dashboard-section-title">⚡ مقاييس الأداء الأساسية</h3>
              <div className="performance-dashboard-grid">
                {Object.entries(report.metrics).map(([key, metric]) => (
                  <div key={key} className="performance-dashboard-grid-item">
                    <div className="performance-dashboard-metric-label">{key}</div>
                    <div className={`performance-dashboard-metric-value ${
                      metric.rating === 'good' ? 'text-success' :
                      metric.rating === 'needs-improvement' ? 'text-accent' :
                      'text-danger'
                    }`}>
                      {key === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                      {key !== 'CLS' && 'ms'}
                    </div>
                    <div className="performance-dashboard-metric-rating">{metric.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="performance-dashboard-section">
            <h3 className="performance-dashboard-section-title">🌐 أداء API</h3>
            <div className="performance-dashboard-grid-4-col">
              <div className="performance-dashboard-grid-item">
                <div className="font-semibold">إجمالي الطلبات</div>
                <div className="performance-dashboard-metric-value text-primary">{report.apiCalls.count}</div>
              </div>
              <div className="performance-dashboard-grid-item">
                <div className="font-semibold">متوسط الوقت</div>
                <div className={`performance-dashboard-metric-value ${getMetricColor(report.apiCalls.averageTime, { good: 1000, needs_improvement: 3000 })}`}>
                  {report.apiCalls.averageTime}ms
                </div>
              </div>
              <div className="performance-dashboard-grid-item">
                <div className="font-semibold">معدل الأخطاء</div>
                <div className={`performance-dashboard-metric-value ${getMetricColor(report.apiCalls.errorRate, { good: 5, needs_improvement: 15 })}`}>
                  {report.apiCalls.errorRate}%
                </div>
              </div>
              <div className="performance-dashboard-grid-item">
                <div className="font-semibold">طلبات بطيئة</div>
                <div className="performance-dashboard-metric-value text-danger">{report.apiCalls.slowCalls.length}</div>
              </div>
            </div>
          </div>

          {report.memory && (
            <div className="performance-dashboard-section">
              <h3 className="performance-dashboard-section-title">💾 استخدام الذاكرة</h3>
              <div className="performance-dashboard-grid">
                <div className="performance-dashboard-grid-item">
                  <div className="font-semibold">المستخدمة</div>
                  <div className="performance-dashboard-metric-value text-primary">{report.memory.used}MB</div>
                </div>
                <div className="performance-dashboard-grid-item">
                  <div className="font-semibold">الإجمالية</div>
                  <div className="performance-dashboard-metric-value text-primary">{report.memory.total}MB</div>
                </div>
                <div className="performance-dashboard-grid-item">
                  <div className="font-semibold">الحد الأقصى</div>
                  <div className="performance-dashboard-metric-value text-primary">{report.memory.limit}MB</div>
                </div>
              </div>
            </div>
          )}

          <div className="performance-dashboard-section">
            <h3 className="performance-dashboard-section-title">🚨 الأخطاء</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-center mb-4">
              <div>
                <div className="font-semibold">إجمالي الأخطاء</div>
                <div className="performance-dashboard-metric-value text-danger">{report.errors.count}</div>
              </div>
              <div>
                <div className="font-semibold">أخطاء حرجة</div>
                <div className="performance-dashboard-metric-value text-danger-dark">{report.errors.critical.length}</div>
              </div>
            </div>
            
            {report.errors.recent.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary mb-2">آخر الأخطاء:</h4>
                <div className="performance-dashboard-error-list">
                  {report.errors.recent.map((error, index) => (
                    <div key={index} className="performance-dashboard-error-item">
                      <div className="performance-dashboard-error-title">{error.type}</div>
                      <div className="performance-dashboard-error-message">{error.message}</div>
                      <div className="performance-dashboard-error-timestamp">{new Date(error.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="performance-dashboard-actions">
            <button
              onClick={updateReport}
              className="performance-dashboard-action-btn performance-dashboard-action-btn-primary"
            >
              🔄 تحديث
            </button>
            <button
              onClick={() => {
                const reportData = JSON.stringify(report, null, 2);
                const blob = new Blob([reportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-report-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="performance-dashboard-action-btn performance-dashboard-action-btn-secondary"
            >
              💾 تحميل التقرير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;