import React, { useState } from 'react';
import {
  Spinner,
  ButtonSpinner,
  OverlaySpinner,
  ProgressBar,
  SkeletonBox,
  SkeletonText,
  SkeletonCard,
  DotsLoader,
  PulseLoader
} from './index';

/**
 * Loading Components Demo
 * 
 * Demonstrates all loading animation components
 * Use this for testing and reference
 */

const LoadingDemo = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(45);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleButtonClick = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 2000);
  };

  const handleProgressIncrease = () => {
    setProgress((prev) => Math.min(100, prev + 10));
  };

  const handleProgressDecrease = () => {
    setProgress((prev) => Math.max(0, prev - 10));
  };

  return (
    <div className="min-h-screen bg-[#E3DAD1] dark:bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-2">
            Loading Animations Demo
          </h1>
          <p className="text-[#304B60]/70 dark:text-[#e0e0e0]/70">
            All components respect prefers-reduced-motion setting
          </p>
        </div>

        {/* Spinners */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Spinners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Spinner size="small" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Small Primary</p>
            </div>
            <div className="text-center space-y-2">
              <Spinner size="medium" color="accent" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Medium Accent</p>
            </div>
            <div className="text-center space-y-2">
              <Spinner size="large" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Large Primary</p>
            </div>
          </div>
        </section>

        {/* Button Spinner */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Button Spinner
          </h2>
          <div className="flex gap-4">
            <button
              onClick={handleButtonClick}
              disabled={isButtonLoading}
              className="px-6 py-3 bg-[#D48161] text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isButtonLoading ? (
                <>
                  <ButtonSpinner color="white" />
                  <span>Processing...</span>
                </>
              ) : (
                'Click Me'
              )}
            </button>
          </div>
        </section>

        {/* Overlay Spinner */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Overlay Spinner
          </h2>
          <button
            onClick={() => setShowOverlay(true)}
            className="px-6 py-3 bg-[#304B60] text-white rounded-lg font-medium"
          >
            Show Overlay
          </button>
          <OverlaySpinner
            show={showOverlay}
            message="Loading data..."
            spinnerSize="large"
            spinnerColor="primary"
          />
          {showOverlay && (
            <button
              onClick={() => setShowOverlay(false)}
              className="ml-4 px-6 py-3 bg-red-500 text-white rounded-lg font-medium"
            >
              Hide Overlay
            </button>
          )}
        </section>

        {/* Progress Bar */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Progress Bar
          </h2>
          <div className="space-y-4">
            <ProgressBar progress={progress} color="accent" showPercentage />
            <div className="flex gap-2">
              <button
                onClick={handleProgressDecrease}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
              >
                -10%
              </button>
              <button
                onClick={handleProgressIncrease}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
              >
                +10%
              </button>
            </div>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Skeleton Loaders
          </h2>
          <div className="space-y-6">
            {/* Skeleton Box */}
            <div>
              <h3 className="text-lg font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Skeleton Box (Pulse)
              </h3>
              <SkeletonBox width="w-full" height="h-20" rounded="rounded-lg" animationType="pulse" />
            </div>

            {/* Skeleton Box Shimmer */}
            <div>
              <h3 className="text-lg font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Skeleton Box (Shimmer)
              </h3>
              <SkeletonBox width="w-full" height="h-20" rounded="rounded-lg" animationType="shimmer" />
            </div>

            {/* Skeleton Text */}
            <div>
              <h3 className="text-lg font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Skeleton Text (3 lines)
              </h3>
              <SkeletonText lines={3} lineHeight="h-4" gap="gap-2" />
            </div>
          </div>
        </section>

        {/* Skeleton Cards */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Skeleton Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Default Card
              </h3>
              <SkeletonCard variant="default" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Job Card
              </h3>
              <SkeletonCard variant="job" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Course Card
              </h3>
              <SkeletonCard variant="course" />
            </div>
          </div>
        </section>

        {/* Dots Loader */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Dots Loader
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <DotsLoader size="small" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Small Primary</p>
            </div>
            <div className="text-center space-y-2">
              <DotsLoader size="medium" color="accent" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Medium Accent</p>
            </div>
            <div className="text-center space-y-2">
              <DotsLoader size="large" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Large Primary</p>
            </div>
          </div>
        </section>

        {/* Pulse Loader */}
        <section className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            Pulse Loader
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <PulseLoader size="small" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Small Primary</p>
            </div>
            <div className="text-center space-y-2">
              <PulseLoader size="medium" color="accent" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Medium Accent</p>
            </div>
            <div className="text-center space-y-2">
              <PulseLoader size="large" color="primary" />
              <p className="text-sm text-[#304B60] dark:text-[#e0e0e0]">Large Primary</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingDemo;
