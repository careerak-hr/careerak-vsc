/**
 * CLS Measurement Example Component
 * 
 * Demonstrates how to measure CLS during loading states
 * 
 * This example shows:
 * 1. Automatic CLS measurement with useCLSMeasurement hook
 * 2. Manual CLS measurement with start/end functions
 * 3. Async operation measurement with useCLSMeasurementAsync
 * 4. Displaying CLS measurements and reports
 */

import React, { useState, useEffect } from 'react';
import { useCLSMeasurement, useCLSMeasurementAsync, useAllCLSMeasurements } from '../hooks/useCLSMeasurement';
import { printCLSReport, saveCLSMeasurements, loadCLSMeasurements, clearCLSMeasurements } from '../utils/clsLoadingMeasurement';

/**
 * Example 1: Automatic CLS measurement
 */
function AutomaticMeasurementExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { measurement } = useCLSMeasurement('AutomaticExample', loading);

  const loadData = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setData(Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Automatic CLS Measurement</h3>
      
      <button
        onClick={loadData}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Data'}
      </button>

      {measurement && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">Last Measurement:</p>
          <p>CLS: {measurement.clsDuringLoading.toFixed(4)}</p>
          <p>Rating: {measurement.rating}</p>
          <p>Duration: {Math.round(measurement.duration)}ms</p>
          <p>Shifts: {measurement.shiftsCount}</p>
        </div>
      )}

      <div className="mt-4 min-h-[200px]">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id} className="p-3 bg-white border rounded">
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Manual CLS measurement
 */
function ManualMeasurementExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { measurement, startMeasurement, endMeasurement } = useCLSMeasurement('ManualExample', false);

  const loadData = async () => {
    // Manually start measurement
    startMeasurement();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setData(Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })));
    setLoading(false);
    
    // Manually end measurement
    const result = endMeasurement();
    console.log('Manual measurement result:', result);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Manual CLS Measurement</h3>
      
      <button
        onClick={loadData}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Data (Manual)'}
      </button>

      {measurement && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">Last Measurement:</p>
          <p>CLS: {measurement.clsDuringLoading.toFixed(4)}</p>
          <p>Rating: {measurement.rating}</p>
          <p className={measurement.passed ? 'text-green-600' : 'text-red-600'}>
            {measurement.passed ? '✅ Passed' : '❌ Failed'}
          </p>
        </div>
      )}

      <div className="mt-4 min-h-[200px]">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id} className="p-3 bg-white border rounded">
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Async operation measurement
 */
function AsyncMeasurementExample() {
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const measureAsync = useCLSMeasurementAsync('AsyncExample');

  const loadData = async () => {
    const measurement = await measureAsync(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newData = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      setData(newData);
    });
    
    setResult(measurement);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Async CLS Measurement</h3>
      
      <button
        onClick={loadData}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Load Data (Async)
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">Measurement Result:</p>
          <p>CLS: {result.clsDuringLoading.toFixed(4)}</p>
          <p>Rating: {result.rating}</p>
          <p>Duration: {Math.round(result.duration)}ms</p>
          <p>Layout Shifts: {result.shiftsCount}</p>
        </div>
      )}

      <div className="mt-4 min-h-[200px]">
        {data.length === 0 ? (
          <p className="text-gray-500">No data loaded</p>
        ) : (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id} className="p-3 bg-white border rounded">
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 4: CLS Report Dashboard
 */
function CLSReportDashboard() {
  const { measurements, summary } = useAllCLSMeasurements();
  const [, forceUpdate] = useState({});

  const handlePrintReport = () => {
    printCLSReport();
  };

  const handleSave = () => {
    saveCLSMeasurements();
    alert('Measurements saved to localStorage');
  };

  const handleLoad = () => {
    loadCLSMeasurements();
    forceUpdate({});
    alert('Measurements loaded from localStorage');
  };

  const handleClear = () => {
    if (window.confirm('Clear all measurements?')) {
      clearCLSMeasurements();
      forceUpdate({});
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">CLS Measurement Dashboard</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePrintReport}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Print Report
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
        >
          Load
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Total Measurements</p>
          <p className="text-2xl font-bold">{summary.totalMeasurements}</p>
        </div>
        <div className="p-3 bg-green-50 rounded">
          <p className="text-sm text-gray-600">Pass Rate</p>
          <p className="text-2xl font-bold">{summary.passRate.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded">
          <p className="text-sm text-gray-600">Average CLS</p>
          <p className="text-2xl font-bold">{summary.averageCLS.toFixed(4)}</p>
        </div>
        <div className="p-3 bg-red-50 rounded">
          <p className="text-sm text-gray-600">Max CLS</p>
          <p className="text-2xl font-bold">{summary.maxCLS.toFixed(4)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Recent Measurements:</h4>
        {measurements.slice(-5).reverse().map(m => (
          <div key={m.id} className="p-2 bg-gray-50 rounded text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{m.componentName}</span>
              <span className={
                m.rating === 'good' ? 'text-green-600' :
                m.rating === 'needs-improvement' ? 'text-yellow-600' :
                'text-red-600'
              }>
                {m.clsDuringLoading.toFixed(4)} ({m.rating})
              </span>
            </div>
            <div className="text-gray-600">
              {Math.round(m.duration)}ms • {m.shiftsCount} shifts
            </div>
          </div>
        ))}
        {measurements.length === 0 && (
          <p className="text-gray-500 text-sm">No measurements yet</p>
        )}
      </div>
    </div>
  );
}

/**
 * Main example component
 */
export default function CLSMeasurementExample() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">CLS Measurement Examples</h1>
        <p className="text-gray-600">
          Demonstrates how to measure Cumulative Layout Shift (CLS) during loading states
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AutomaticMeasurementExample />
        <ManualMeasurementExample />
        <AsyncMeasurementExample />
        <CLSReportDashboard />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">💡 Tips for Preventing Layout Shifts</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Always set explicit dimensions on images and media</li>
          <li>Use skeleton loaders that match content dimensions</li>
          <li>Reserve space with min-height before content loads</li>
          <li>Use transform and opacity for animations (GPU-accelerated)</li>
          <li>Avoid inserting content above existing content</li>
          <li>Use aspect ratio containers for responsive images</li>
          <li>Preload critical fonts with font-display: swap</li>
        </ul>
      </div>

      <div className="p-4 bg-gray-50 border rounded">
        <h3 className="font-bold mb-2">🎯 CLS Thresholds</h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-green-600">✅ Good:</span> CLS &lt; 0.1</p>
          <p><span className="text-yellow-600">⚠️ Needs Improvement:</span> 0.1 ≤ CLS &lt; 0.25</p>
          <p><span className="text-red-600">❌ Poor:</span> CLS ≥ 0.25</p>
        </div>
      </div>
    </div>
  );
}
