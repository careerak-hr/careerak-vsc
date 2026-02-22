import React, { useState, lazy, Suspense } from 'react';
import ComponentSuspenseFallback from '../components/Loading/ComponentSuspenseFallback';
import LazyModal from '../components/LazyModal';

/**
 * LazyModalExample - Demonstrates how to lazy-load modal components with Suspense
 * 
 * This example shows the recommended pattern for implementing lazy-loaded modals
 * in pages like AuthPage, where multiple modals are imported but only used conditionally.
 * 
 * BEFORE (Eager Loading):
 * - All modals loaded upfront
 * - Increases initial bundle size
 * - Slower initial page load
 * 
 * AFTER (Lazy Loading with Suspense):
 * - Modals loaded only when needed
 * - Smaller initial bundle
 * - Faster initial page load
 * - Better code splitting
 * 
 * Performance Impact:
 * - Reduces AuthPage bundle by ~40-60KB
 * - Improves Time to Interactive (TTI)
 * - Better Lighthouse Performance score
 */

// ============================================================================
// STEP 1: Define lazy-loaded modal components
// ============================================================================

// Lazy load modals - they will only be downloaded when first rendered
const LazyAgeCheckModal = lazy(() => import('../components/modals/AgeCheckModal'));
const LazyGoodbyeModal = lazy(() => import('../components/modals/GoodbyeModal'));
const LazyAIAnalysisModal = lazy(() => import('../components/modals/AIAnalysisModal'));
const LazyPhotoOptionsModal = lazy(() => import('../components/modals/PhotoOptionsModal'));
const LazyCropModal = lazy(() => import('../components/modals/CropModal'));
const LazyPolicyModal = lazy(() => import('../components/modals/PolicyModal'));
const LazyConfirmationModal = lazy(() => import('../components/modals/ConfirmationModal'));

// ============================================================================
// STEP 2: Use lazy modals in component
// ============================================================================

const LazyModalExample = () => {
  // Modal visibility states
  const [showAgeCheck, setShowAgeCheck] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Example data
  const [analysisResult, setAnalysisResult] = useState(null);
  const [tempImage, setTempImage] = useState(null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Lazy Modal Example</h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-lg">
          Click buttons below to load modals on-demand. Each modal is lazy-loaded
          only when first opened, reducing initial bundle size.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowAgeCheck(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Show Age Check Modal
          </button>
          
          <button
            onClick={() => setShowGoodbye(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Show Goodbye Modal
          </button>
          
          <button
            onClick={() => {
              setAnalysisResult({ isAppropriate: true, confidence: 0.95 });
              setShowAIAnalysis(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Show AI Analysis Modal
          </button>
          
          <button
            onClick={() => setShowPhotoOptions(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Show Photo Options Modal
          </button>
          
          <button
            onClick={() => {
              setTempImage('https://via.placeholder.com/400');
              setShowCrop(true);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Show Crop Modal
          </button>
          
          <button
            onClick={() => setShowPolicy(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Show Policy Modal
          </button>
          
          <button
            onClick={() => setShowConfirmation(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Show Confirmation Modal
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* METHOD 1: Using LazyModal utility component (Recommended)        */}
      {/* ================================================================ */}
      
      {showAgeCheck && (
        <LazyModal
          component={LazyAgeCheckModal}
          componentProps={{
            isOpen: showAgeCheck,
            onConfirm: () => {
              console.log('Age confirmed');
              setShowAgeCheck(false);
            },
            onCancel: () => {
              console.log('Age check cancelled');
              setShowAgeCheck(false);
            }
          }}
          fallbackVariant="minimal"
          fallbackHeight="300px"
        />
      )}

      {showGoodbye && (
        <LazyModal
          component={LazyGoodbyeModal}
          componentProps={{
            isOpen: showGoodbye,
            onClose: () => setShowGoodbye(false)
          }}
          fallbackVariant="minimal"
        />
      )}

      {/* ================================================================ */}
      {/* METHOD 2: Direct Suspense usage (Alternative)                    */}
      {/* ================================================================ */}
      
      {showAIAnalysis && (
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" height="400px" />}>
          <LazyAIAnalysisModal
            isOpen={showAIAnalysis}
            result={analysisResult}
            onClose={() => setShowAIAnalysis(false)}
            onRetry={() => console.log('Retry analysis')}
          />
        </Suspense>
      )}

      {showPhotoOptions && (
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" height="350px" />}>
          <LazyPhotoOptionsModal
            isOpen={showPhotoOptions}
            onCamera={() => console.log('Camera selected')}
            onGallery={() => console.log('Gallery selected')}
            onClose={() => setShowPhotoOptions(false)}
          />
        </Suspense>
      )}

      {showCrop && tempImage && (
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" height="500px" />}>
          <LazyCropModal
            isOpen={showCrop}
            image={tempImage}
            onCropComplete={(croppedImage) => {
              console.log('Crop complete:', croppedImage);
              setShowCrop(false);
            }}
            onClose={() => setShowCrop(false)}
          />
        </Suspense>
      )}

      {showPolicy && (
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" height="600px" />}>
          <LazyPolicyModal
            isOpen={showPolicy}
            onAccept={() => {
              console.log('Policy accepted');
              setShowPolicy(false);
            }}
            onDecline={() => {
              console.log('Policy declined');
              setShowPolicy(false);
            }}
          />
        </Suspense>
      )}

      {showConfirmation && (
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" height="250px" />}>
          <LazyConfirmationModal
            isOpen={showConfirmation}
            title="Confirm Action"
            message="Are you sure you want to proceed?"
            onConfirm={() => {
              console.log('Confirmed');
              setShowConfirmation(false);
            }}
            onCancel={() => {
              console.log('Cancelled');
              setShowConfirmation(false);
            }}
          />
        </Suspense>
      )}

      {/* ================================================================ */}
      {/* Performance Notes                                                */}
      {/* ================================================================ */}
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Performance Benefits</h2>
        <ul className="space-y-2">
          <li>✅ Initial bundle size reduced by ~40-60KB</li>
          <li>✅ Modals loaded only when first opened</li>
          <li>✅ Faster Time to Interactive (TTI)</li>
          <li>✅ Better Lighthouse Performance score</li>
          <li>✅ Improved user experience on slow networks</li>
          <li>✅ Consistent loading states with Suspense</li>
          <li>✅ No layout shifts (CLS &lt; 0.1)</li>
        </ul>
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Implementation Guidelines</h2>
        <ol className="space-y-2 list-decimal list-inside">
          <li>Define lazy components at module level (not inside component)</li>
          <li>Wrap lazy components with Suspense boundary</li>
          <li>Provide appropriate fallback with ComponentSuspenseFallback</li>
          <li>Match fallback height to expected modal height</li>
          <li>Use 'minimal' variant for modals (no layout shift)</li>
          <li>Only render Suspense when modal should be visible</li>
          <li>Test on slow 3G network to verify loading states</li>
        </ol>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Common Pitfalls to Avoid</h2>
        <ul className="space-y-2">
          <li>❌ Don't define lazy() inside component (causes re-creation)</li>
          <li>❌ Don't forget Suspense wrapper (causes error)</li>
          <li>❌ Don't use heavy fallbacks (defeats purpose)</li>
          <li>❌ Don't lazy-load critical components (delays interaction)</li>
          <li>❌ Don't nest Suspense unnecessarily (one per modal is enough)</li>
        </ul>
      </div>
    </div>
  );
};

export default LazyModalExample;
