/**
 * ErrorRecoveryExample - Demonstration of advanced error recovery strategies
 * 
 * This component demonstrates all recovery strategies:
 * - RETRY
 * - RETRY_WITH_BACKOFF
 * - FALLBACK_UI
 * - GRACEFUL_DEGRADATION
 * - STATE_RESTORATION
 * - CACHE_FALLBACK
 * - OFFLINE_QUEUE
 * - CIRCUIT_BREAKER
 * - RELOAD_COMPONENT
 * 
 * Use this as a reference for implementing error recovery in your components
 */

import React, { useState, useEffect } from 'react';
import { useErrorRecovery, useRecoveryState } from '../../hooks/useErrorRecovery';
import { getRecoveryStatistics, resetRecoveryState } from '../../utils/errorRecoveryStrategies';
import { useApp } from '../../context/AppContext';

const ErrorRecoveryExample = () => {
  const { language } = useApp();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [errorType, setErrorType] = useState('none');
  
  const {
    executeWithRecovery,
    cacheData,
    saveState,
    isRecovering,
    recoveryAttempts,
    canRecover,
    lastError,
    lastRecoveryResult,
    getStatistics: getComponentStats,
    resetRecovery
  } = useErrorRecovery('ErrorRecoveryExample', {
    maxRetries: 3,
    onRecoverySuccess: (result) => {
      console.log('✅ Recovery successful:', result);
    },
    onRecoveryFailure: (error) => {
      console.error('❌ Recovery failed:', error);
    }
  });

  // Example with useRecoveryState
  const [formData, setFormData, formRecovery] = useRecoveryState('ErrorRecoveryForm', {
    name: '',
    email: ''
  });

  // Simulate different error types
  const simulateError = async (type) => {
    setErrorType(type);

    switch (type) {
      case 'network':
        throw new Error('Network Error');
      
      case 'timeout':
        await new Promise(resolve => setTimeout(resolve, 5000));
        throw new Error('Timeout Error');
      
      case 'server':
        const error = new Error('Server Error');
        error.response = { status: 500 };
        throw error;
      
      case 'offline':
        const offlineError = new Error('Offline');
        offlineError.networkError = true;
        offlineError.type = 'OFFLINE_ERROR';
        throw offlineError;
      
      case 'component':
        throw new Error('Component Error');
      
      default:
        return { success: true, data: ['Item 1', 'Item 2', 'Item 3'] };
    }
  };

  // Example 1: Simple Retry
  const handleSimpleRetry = async () => {
    const result = await executeWithRecovery(
      async () => {
        const data = await simulateError('network');
        return data;
      },
      {
        fallbackData: [],
        onSuccess: (data) => {
          setData(data.data);
          console.log('Data fetched:', data);
        }
      }
    );
  };

  // Example 2: Retry with Backoff
  const handleRetryWithBackoff = async () => {
    const result = await executeWithRecovery(
      async () => {
        const data = await simulateError('timeout');
        return data;
      },
      {
        fallbackData: [],
        onSuccess: (data) => setData(data.data)
      }
    );
  };

  // Example 3: Cache Fallback
  const handleCacheFallback = async () => {
    // First, cache some data
    const cachedData = ['Cached Item 1', 'Cached Item 2'];
    cacheData('example-data', cachedData, 300000); // 5 min TTL

    // Then simulate error
    const result = await executeWithRecovery(
      async () => {
        const data = await simulateError('network');
        return data;
      },
      {
        cacheKey: 'example-data',
        hasCache: true,
        fallbackData: [],
        onSuccess: (data) => setData(data.data || data)
      }
    );
  };

  // Example 4: Offline Queue
  const handleOfflineQueue = async () => {
    const result = await executeWithRecovery(
      async () => {
        const data = await simulateError('offline');
        return data;
      },
      {
        request: {
          method: 'POST',
          url: '/api/example',
          data: { test: 'data' }
        },
        fallbackData: [],
        onSuccess: (data) => {
          console.log('Request queued for later');
        }
      }
    );
  };

  // Example 5: State Restoration
  const handleStateRestoration = async () => {
    // Save state before operation
    const currentState = { items: data, timestamp: Date.now() };
    saveState(currentState);

    const result = await executeWithRecovery(
      async (restoredState) => {
        console.log('Restored state:', restoredState);
        const data = await simulateError('component');
        return data;
      },
      {
        fallbackData: [],
        onSuccess: (data) => setData(data.data)
      }
    );
  };

  // Example 6: Form Submission with Recovery
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    await formRecovery.executeWithRecovery(
      async () => {
        // Simulate API call
        console.log('Submitting form:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      },
      {
        request: {
          method: 'POST',
          url: '/api/form',
          data: formData
        },
        onSuccess: () => {
          alert('Form submitted successfully!');
          setFormData({ name: '', email: '' });
        },
        onFailure: () => {
          alert('Form submission failed. Will retry when online.');
        }
      }
    );
  };

  // Update statistics
  useEffect(() => {
    const interval = setInterval(() => {
      const componentStats = getComponentStats();
      const allStats = getRecoveryStatistics();
      setStats({ component: componentStats, all: allStats });
    }, 1000);

    return () => clearInterval(interval);
  }, [getComponentStats]);

  // Translations
  const translations = {
    ar: {
      title: 'مثال على استراتيجيات استعادة الأخطاء',
      description: 'هذا المكون يوضح جميع استراتيجيات الاستعادة المتقدمة',
      simpleRetry: 'إعادة محاولة بسيطة',
      retryBackoff: 'إعادة محاولة مع تأخير',
      cacheFallback: 'استخدام الذاكرة المؤقتة',
      offlineQueue: 'قائمة الانتظار غير المتصلة',
      stateRestoration: 'استعادة الحالة',
      formSubmit: 'إرسال النموذج',
      resetCircuit: 'إعادة تعيين قاطع الدائرة',
      recovering: 'جاري الاستعادة...',
      attempt: 'المحاولة',
      cannotRecover: 'لا يمكن الاستعادة (قاطع الدائرة مفتوح)',
      lastError: 'آخر خطأ',
      lastResult: 'آخر نتيجة',
      statistics: 'الإحصائيات',
      successRate: 'معدل النجاح',
      attempts: 'المحاولات',
      successes: 'النجاحات',
      failures: 'الفشل',
      circuitBreaker: 'قاطع الدائرة',
      formTitle: 'نموذج مع الاستعادة',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      submit: 'إرسال'
    },
    en: {
      title: 'Error Recovery Strategies Example',
      description: 'This component demonstrates all advanced recovery strategies',
      simpleRetry: 'Simple Retry',
      retryBackoff: 'Retry with Backoff',
      cacheFallback: 'Cache Fallback',
      offlineQueue: 'Offline Queue',
      stateRestoration: 'State Restoration',
      formSubmit: 'Form Submit',
      resetCircuit: 'Reset Circuit Breaker',
      recovering: 'Recovering...',
      attempt: 'Attempt',
      cannotRecover: 'Cannot recover (Circuit breaker open)',
      lastError: 'Last Error',
      lastResult: 'Last Result',
      statistics: 'Statistics',
      successRate: 'Success Rate',
      attempts: 'Attempts',
      successes: 'Successes',
      failures: 'Failures',
      circuitBreaker: 'Circuit Breaker',
      formTitle: 'Form with Recovery',
      name: 'Name',
      email: 'Email',
      submit: 'Submit'
    },
    fr: {
      title: 'Exemple de Stratégies de Récupération d\'Erreurs',
      description: 'Ce composant démontre toutes les stratégies de récupération avancées',
      simpleRetry: 'Réessai Simple',
      retryBackoff: 'Réessai avec Délai',
      cacheFallback: 'Cache de Secours',
      offlineQueue: 'File d\'Attente Hors Ligne',
      stateRestoration: 'Restauration d\'État',
      formSubmit: 'Soumettre le Formulaire',
      resetCircuit: 'Réinitialiser le Disjoncteur',
      recovering: 'Récupération...',
      attempt: 'Tentative',
      cannotRecover: 'Impossible de récupérer (Disjoncteur ouvert)',
      lastError: 'Dernière Erreur',
      lastResult: 'Dernier Résultat',
      statistics: 'Statistiques',
      successRate: 'Taux de Réussite',
      attempts: 'Tentatives',
      successes: 'Réussites',
      failures: 'Échecs',
      circuitBreaker: 'Disjoncteur',
      formTitle: 'Formulaire avec Récupération',
      name: 'Nom',
      email: 'Email',
      submit: 'Soumettre'
    }
  };

  const t = translations[language] || translations.ar;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
      <p className="text-gray-600 mb-6">{t.description}</p>

      {/* Recovery Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Recovery Status</h2>
        
        {isRecovering && (
          <div className="text-blue-600 mb-2">
            {t.recovering} ({t.attempt} {recoveryAttempts})
          </div>
        )}

        {!canRecover && (
          <div className="text-red-600 mb-2">
            ⚠️ {t.cannotRecover}
          </div>
        )}

        {lastError && (
          <div className="mb-2">
            <strong>{t.lastError}:</strong> {lastError.message}
          </div>
        )}

        {lastRecoveryResult && (
          <div className="mb-2">
            <strong>{t.lastResult}:</strong>
            <pre className="text-sm bg-white p-2 rounded mt-1">
              {JSON.stringify(lastRecoveryResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSimpleRetry}
          disabled={isRecovering}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {t.simpleRetry}
        </button>

        <button
          onClick={handleRetryWithBackoff}
          disabled={isRecovering}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {t.retryBackoff}
        </button>

        <button
          onClick={handleCacheFallback}
          disabled={isRecovering}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
        >
          {t.cacheFallback}
        </button>

        <button
          onClick={handleOfflineQueue}
          disabled={isRecovering}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-300"
        >
          {t.offlineQueue}
        </button>

        <button
          onClick={handleStateRestoration}
          disabled={isRecovering}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:bg-gray-300"
        >
          {t.stateRestoration}
        </button>

        <button
          onClick={() => {
            resetRecovery();
            resetRecoveryState('ErrorRecoveryExample');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {t.resetCircuit}
        </button>
      </div>

      {/* Data Display */}
      {data.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Data:</h3>
          <ul className="list-disc list-inside">
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Example */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">{t.formTitle}</h3>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t.email}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={formRecovery.isRecovering}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {formRecovery.isRecovering ? t.recovering : t.submit}
          </button>
        </form>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">{t.statistics}</h3>
          
          {/* Component Stats */}
          {stats.component && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Component: ErrorRecoveryExample</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <strong>{t.successRate}:</strong>{' '}
                  {(stats.component.successRate * 100).toFixed(1)}%
                </div>
                <div>
                  <strong>{t.attempts}:</strong>{' '}
                  {stats.component.history?.attempts || 0}
                </div>
                <div>
                  <strong>{t.successes}:</strong>{' '}
                  {stats.component.history?.successes || 0}
                </div>
                <div>
                  <strong>{t.failures}:</strong>{' '}
                  {stats.component.history?.failures || 0}
                </div>
                <div className="col-span-2">
                  <strong>{t.circuitBreaker}:</strong>{' '}
                  <span className={
                    stats.component.circuitBreaker === 'CLOSED' ? 'text-green-600' :
                    stats.component.circuitBreaker === 'OPEN' ? 'text-red-600' :
                    'text-yellow-600'
                  }>
                    {stats.component.circuitBreaker}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Overall Stats */}
          {stats.all?.overall && (
            <div>
              <h4 className="font-medium mb-2">Overall Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <strong>{t.successRate}:</strong>{' '}
                  {(stats.all.overall.successRate * 100).toFixed(1)}%
                </div>
                <div>
                  <strong>{t.attempts}:</strong>{' '}
                  {stats.all.overall.totalAttempts}
                </div>
                <div>
                  <strong>{t.successes}:</strong>{' '}
                  {stats.all.overall.totalSuccesses}
                </div>
                <div>
                  <strong>{t.failures}:</strong>{' '}
                  {stats.all.overall.totalFailures}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Example */}
      <div className="mt-6 bg-gray-900 text-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Code Example:</h3>
        <pre className="text-sm overflow-auto">
{`import { useErrorRecovery } from '../hooks/useErrorRecovery';

const MyComponent = () => {
  const { executeWithRecovery } = useErrorRecovery('MyComponent');

  const fetchData = async () => {
    const result = await executeWithRecovery(
      async () => {
        const response = await api.get('/data');
        return response.data;
      },
      {
        fallbackData: [],
        cacheKey: 'my-data',
        onSuccess: (data) => setData(data),
        onFailure: (error) => console.error(error)
      }
    );
  };

  return <div>{/* Your UI */}</div>;
};`}
        </pre>
      </div>
    </div>
  );
};

export default ErrorRecoveryExample;
