import React, { Suspense, lazy, useState } from 'react';
import ComponentSuspenseFallback from './ComponentSuspenseFallback';
import { useTheme } from '../../context/ThemeContext';

/**
 * ComponentSuspenseFallback Demo
 * 
 * Demonstrates all variants of the ComponentSuspenseFallback component.
 * Shows how to use it with React.lazy() and Suspense.
 */

// Simulate lazy-loaded components with artificial delay
const createLazyComponent = (name, delay = 2000) => {
  return lazy(() => 
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          default: () => (
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h3 className="font-bold text-green-800 dark:text-green-200">
                {name} Loaded!
              </h3>
              <p className="text-green-700 dark:text-green-300 mt-2">
                This component was lazy-loaded after {delay}ms
              </p>
            </div>
          )
        });
      }, delay);
    })
  );
};

const ComponentSuspenseFallbackDemo = () => {
  const { isDark } = useTheme();
  const [activeDemo, setActiveDemo] = useState(null);

  const demos = [
    { id: 'minimal', label: 'Minimal', variant: 'minimal' },
    { id: 'card', label: 'Card', variant: 'card' },
    { id: 'list', label: 'List', variant: 'list' },
    { id: 'form', label: 'Form', variant: 'form' }
  ];

  const LazyComponent = activeDemo ? createLazyComponent(activeDemo.label) : null;

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-[#1a1a1a] text-[#e0e0e0]' : 'bg-[#E3DAD1] text-[#304B60]'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Component Suspense Fallback Demo</h1>
        <p className="mb-8 opacity-80">
          Click a button to see the loading state for each variant
        </p>

        {/* Variant Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeDemo?.id === demo.id
                  ? 'bg-[#D48161] text-white'
                  : isDark
                  ? 'bg-[#2d2d2d] text-[#e0e0e0] hover:bg-[#3d3d3d]'
                  : 'bg-white text-[#304B60] hover:bg-gray-100'
              }`}
            >
              {demo.label}
            </button>
          ))}
          <button
            onClick={() => setActiveDemo(null)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-[#2d2d2d] text-[#e0e0e0] hover:bg-[#3d3d3d]'
                : 'bg-white text-[#304B60] hover:bg-gray-100'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Demo Area */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-[#2d2d2d]' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">
            {activeDemo ? `${activeDemo.label} Variant` : 'Select a variant to see the demo'}
          </h2>

          {activeDemo && LazyComponent && (
            <Suspense fallback={<ComponentSuspenseFallback variant={activeDemo.variant} />}>
              <LazyComponent />
            </Suspense>
          )}

          {!activeDemo && (
            <div className="text-center py-12 opacity-60">
              <p>Click a button above to see the loading state</p>
            </div>
          )}
        </div>

        {/* Code Examples */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Usage Examples</h2>

          {demos.map((demo) => (
            <div key={demo.id} className={`rounded-lg p-6 ${isDark ? 'bg-[#2d2d2d]' : 'bg-white'}`}>
              <h3 className="text-lg font-bold mb-3">{demo.label} Variant</h3>
              <pre className={`p-4 rounded overflow-x-auto ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
                <code className="text-sm">
{`<Suspense fallback={<ComponentSuspenseFallback variant="${demo.variant}" />}>
  <LazyComponent />
</Suspense>`}
                </code>
              </pre>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className={`mt-8 rounded-lg p-6 ${isDark ? 'bg-[#2d2d2d]' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="space-y-2">
            <li>✅ Multiple variants for different use cases</li>
            <li>✅ Dark mode support</li>
            <li>✅ Smooth 200ms fade-in animation</li>
            <li>✅ Respects prefers-reduced-motion</li>
            <li>✅ Accessible with ARIA live regions</li>
            <li>✅ Prevents layout shifts (CLS &lt; 0.1)</li>
            <li>✅ Customizable height and className</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComponentSuspenseFallbackDemo;
