import React, { useState, useEffect } from 'react';

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
      // تحديث التقرير فوراً
      updateReport();
      
      // تحديث كل 5 ثوان
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
  }, [isVisible]);

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

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getMetricColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needs_improvement) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#304B60] text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">📊 لوحة مراقبة الأداء</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Info */}
          <div className="bg-[#E3DAD1] p-4 rounded-lg">
            <h3 className="font-bold text-[#304B60] mb-2">📱 معلومات الجلسة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">مدة الجلسة:</span> {formatDuration(report.session.duration)}
              </div>
              <div>
                <span className="font-semibold">الصفحة الحالية:</span> {window.location.pathname}
              </div>
            </div>
          </div>

          {/* Web Vitals */}
          {Object.keys(report.metrics).length > 0 && (
            <div className="bg-[#E3DAD1] p-4 rounded-lg">
              <h3 className="font-bold text-[#304B60] mb-2">⚡ مقاييس الأداء الأساسية</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.metrics).map(([key, metric]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm font-semibold text-gray-600">{key}</div>
                    <div className={`text-lg font-bold ${
                      metric.rating === 'good' ? 'text-green-600' :
                      metric.rating === 'needs-improvement' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {key === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                      {key !== 'CLS' && 'ms'}
                    </div>
                    <div className="text-xs text-gray-500">{metric.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Performance */}
          <div className="bg-[#E3DAD1] p-4 rounded-lg">
            <h3 className="font-bold text-[#304B60] mb-2">🌐 أداء API</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">إجمالي الطلبات</div>
                <div className="text-lg font-bold text-[#304B60]">{report.apiCalls.count}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">متوسط الوقت</div>
                <div className={`text-lg font-bold ${getMetricColor(report.apiCalls.averageTime, { good: 1000, needs_improvement: 3000 })}`}>
                  {report.apiCalls.averageTime}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">معدل الأخطاء</div>
                <div className={`text-lg font-bold ${getMetricColor(report.apiCalls.errorRate, { good: 5, needs_improvement: 15 })}`}>
                  {report.apiCalls.errorRate}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">طلبات بطيئة</div>
                <div className="text-lg font-bold text-red-600">{report.apiCalls.slowCalls.length}</div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {report.memory && (
            <div className="bg-[#E3DAD1] p-4 rounded-lg">
              <h3 className="font-bold text-[#304B60] mb-2">💾 استخدام الذاكرة</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-center">
                <div>
                  <div className="font-semibold">المستخدمة</div>
                  <div className="text-lg font-bold text-[#304B60]">{report.memory.used}MB</div>
                </div>
                <div>
                  <div className="font-semibold">الإجمالية</div>
                  <div className="text-lg font-bold text-[#304B60]">{report.memory.total}MB</div>
                </div>
                <div>
                  <div className="font-semibold">الحد الأقصى</div>
                  <div className="text-lg font-bold text-[#304B60]">{report.memory.limit}MB</div>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          <div className="bg-[#E3DAD1] p-4 rounded-lg">
            <h3 className="font-bold text-[#304B60] mb-2">🚨 الأخطاء</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-center mb-4">
              <div>
                <div className="font-semibold">إجمالي الأخطاء</div>
                <div className="text-lg font-bold text-red-600">{report.errors.count}</div>
              </div>
              <div>
                <div className="font-semibold">أخطاء حرجة</div>
                <div className="text-lg font-bold text-red-800">{report.errors.critical.length}</div>
              </div>
            </div>
            
            {report.errors.recent.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#304B60] mb-2">آخر الأخطاء:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {report.errors.recent.map((error, index) => (
                    <div key={index} className="bg-red-50 p-2 rounded text-xs">
                      <div className="font-semibold text-red-800">{error.type}</div>
                      <div className="text-red-600 truncate">{error.message}</div>
                      <div className="text-gray-500">{new Date(error.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={updateReport}
              className="bg-[#304B60] text-[#D48161] px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
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
              className="bg-[#D48161] text-[#304B60] px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
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