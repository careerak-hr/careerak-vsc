/**
 * Layout Shift Prevention Example
 * 
 * Demonstrates various techniques for preventing layout shifts during loading.
 * 
 * Requirements:
 * - FR-LOAD-8: Coordinate loading states to prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 */

import React, { useState, useEffect } from 'react';
import {
  useReservedSpace,
  useSkeletonDimensions,
  useImageContainer,
  useCoordinatedLoading,
  useLoadingTransition,
  useCLSMeasurement,
  useStableList,
} from '../hooks/useLayoutShiftPrevention';
import SkeletonLoader from '../components/SkeletonLoaders/SkeletonLoader';

// Example 1: Reserved Space
const ReservedSpaceExample = () => {
  const { containerStyle, loading, setLoading } = useReservedSpace('300px');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 1: Reserved Space</h3>
      <div style={containerStyle} className="border border-gray-300 rounded p-4">
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader width="100%" height="20px" />
            <SkeletonLoader width="80%" height="20px" />
            <SkeletonLoader width="90%" height="20px" />
          </div>
        ) : (
          <div>
            <h4 className="text-xl font-bold mb-2">Content Loaded</h4>
            <p>This content loaded without causing a layout shift because we reserved space with min-height.</p>
            <p className="mt-2">The container had a minimum height of 300px, preventing any shift when content appeared.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 2: Skeleton Dimensions
const SkeletonDimensionsExample = () => {
  const [loading, setLoading] = useState(true);
  const cardDimensions = useSkeletonDimensions('card');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 2: Skeleton Matching Content</h3>
      <div className="border border-gray-300 rounded p-4">
        {loading ? (
          <SkeletonLoader {...cardDimensions} />
        ) : (
          <div style={{ minHeight: cardDimensions.minHeight }}>
            <h4 className="text-xl font-bold mb-2">Card Content</h4>
            <p>This card loaded without layout shift because the skeleton matched its dimensions.</p>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded">Action 1</button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded">Action 2</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 3: Image Container with Aspect Ratio
const ImageContainerExample = () => {
  const { containerStyle, imageStyle, loading, setLoading } = useImageContainer(800, 600);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 3: Image with Aspect Ratio</h3>
      <div style={containerStyle}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <SkeletonLoader width="100%" height="100%" />
          </div>
        )}
        <img
          src="https://via.placeholder.com/800x600"
          alt="Example"
          style={imageStyle}
          onLoad={() => setLoading(false)}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        The image container reserves space using aspect ratio (75%), preventing layout shift.
      </p>
    </div>
  );
};

// Example 4: Coordinated Loading
const CoordinatedLoadingExample = () => {
  const { sections, updateSection, allLoaded, loadingCount } = useCoordinatedLoading([
    { id: 'header', minHeight: '100px', loading: true },
    { id: 'content', minHeight: '300px', loading: true },
    { id: 'footer', minHeight: '80px', loading: true },
  ]);

  useEffect(() => {
    const timers = [
      setTimeout(() => updateSection('header', false), 1000),
      setTimeout(() => updateSection('content', false), 2000),
      setTimeout(() => updateSection('footer', false), 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [updateSection]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 4: Coordinated Loading States</h3>
      <div className="mb-2 text-sm">
        Loading: {loadingCount} sections | All loaded: {allLoaded ? 'Yes' : 'No'}
      </div>
      
      {sections.map(section => (
        <div
          key={section.id}
          style={section.style}
          className="border border-gray-300 rounded p-4 mb-2"
        >
          {section.loading ? (
            <div className="space-y-2">
              <SkeletonLoader width="60%" height="16px" />
              <SkeletonLoader width="80%" height="16px" />
            </div>
          ) : (
            <div>
              <h4 className="font-bold capitalize">{section.id} Content</h4>
              <p>This section loaded without causing layout shift.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Example 5: Loading Transition
const LoadingTransitionExample = () => {
  const { transitionStyle, loading, setLoading } = useLoadingTransition(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 5: Smooth Loading Transition</h3>
      <div style={transitionStyle} className="border border-gray-300 rounded p-4">
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader width="100%" height="20px" />
            <SkeletonLoader width="80%" height="20px" />
          </div>
        ) : (
          <div>
            <h4 className="text-xl font-bold mb-2">Smooth Transition</h4>
            <p>This content faded in smoothly using GPU-accelerated properties (opacity, transform).</p>
            <p className="mt-2">No layout shift occurred because we used transform instead of position changes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 6: Stable List
const StableListExample = () => {
  const { containerStyle, loading, setLoading } = useStableList(5, 80);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([
        { id: 1, title: 'Item 1', description: 'Description for item 1' },
        { id: 2, title: 'Item 2', description: 'Description for item 2' },
        { id: 3, title: 'Item 3', description: 'Description for item 3' },
        { id: 4, title: 'Item 4', description: 'Description for item 4' },
        { id: 5, title: 'Item 5', description: 'Description for item 5' },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 6: Stable List Rendering</h3>
      <div style={containerStyle} className="space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-300 rounded p-4" style={{ height: '80px' }}>
              <SkeletonLoader width="40%" height="16px" className="mb-2" />
              <SkeletonLoader width="80%" height="12px" />
            </div>
          ))
        ) : (
          items.map(item => (
            <div key={item.id} className="border border-gray-300 rounded p-4" style={{ minHeight: '80px' }}>
              <h5 className="font-bold">{item.title}</h5>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Example 7: CLS Measurement
const CLSMeasurementExample = () => {
  const { cls, isGood, needsImprovement, isPoor } = useCLSMeasurement();

  const getStatusColor = () => {
    if (isGood) return 'text-green-600';
    if (needsImprovement) return 'text-yellow-600';
    if (isPoor) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (isGood) return 'Good (< 0.1)';
    if (needsImprovement) return 'Needs Improvement (0.1 - 0.25)';
    if (isPoor) return 'Poor (≥ 0.25)';
    return 'Measuring...';
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">Example 7: CLS Measurement</h3>
      <div className="border border-gray-300 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Cumulative Layout Shift (CLS)</p>
            <p className={`text-2xl font-bold ${getStatusColor()}`}>
              {cls.toFixed(4)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>✅ Target: CLS &lt; 0.1</p>
          <p>⚠️ Needs Improvement: 0.1 ≤ CLS &lt; 0.25</p>
          <p>❌ Poor: CLS ≥ 0.25</p>
        </div>
      </div>
    </div>
  );
};

// Main Example Component
const LayoutShiftPreventionExample = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Layout Shift Prevention Examples</h1>
      <p className="text-gray-600 mb-8">
        Demonstrating techniques to prevent Cumulative Layout Shift (CLS) during loading states.
        Target: CLS &lt; 0.1
      </p>

      <CLSMeasurementExample />
      <ReservedSpaceExample />
      <SkeletonDimensionsExample />
      <ImageContainerExample />
      <CoordinatedLoadingExample />
      <LoadingTransitionExample />
      <StableListExample />

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Key Principles</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Reserve space with min-height before content loads</li>
          <li>✅ Match skeleton dimensions to actual content</li>
          <li>✅ Use aspect ratio for images and media</li>
          <li>✅ Coordinate multiple loading states</li>
          <li>✅ Use GPU-accelerated properties (transform, opacity)</li>
          <li>✅ Avoid animating width, height, top, left</li>
          <li>✅ Set explicit dimensions on images</li>
          <li>✅ Measure CLS to verify improvements</li>
        </ul>
      </div>
    </div>
  );
};

export default LayoutShiftPreventionExample;
