/**
 * Modal Animation Demo
 * 
 * Interactive demo showcasing all modal animations with 200-300ms timing.
 * 
 * Features:
 * - Test all modal animation variants
 * - Verify timing (200-300ms)
 * - Test with different modal types
 * - Test prefers-reduced-motion support
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';
import { modalVariants } from '../utils/animationVariants';

const ModalAnimationDemo = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('scaleIn');
  const { shouldAnimate } = useAnimation();

  const variants = [
    { name: 'scaleIn', label: 'Scale In (Default)', duration: '300ms' },
    { name: 'fade', label: 'Fade', duration: '300ms' },
    { name: 'slideUp', label: 'Slide Up', duration: '300ms' },
    { name: 'slideDown', label: 'Slide Down', duration: '300ms' },
    { name: 'zoomIn', label: 'Zoom In (Spring)', duration: '~300ms' },
  ];

  const modalTypes = [
    { id: 'confirmation', title: 'Confirmation Modal', content: 'Are you sure you want to proceed?' },
    { id: 'alert', title: 'Alert Modal', content: 'This is an important message!' },
    { id: 'form', title: 'Form Modal', content: 'Please fill out the form below.' },
    { id: 'info', title: 'Information Modal', content: 'Here is some useful information for you.' },
  ];

  const openModal = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#E3DAD1] dark:bg-[#1a1a1a] p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#304B60] dark:text-[#e0e0e0] mb-4 transition-colors duration-300">
            Modal Animation Demo
          </h1>
          <p className="text-lg text-[#304B60]/80 dark:text-[#e0e0e0]/80 transition-colors duration-300">
            All modal animations are smooth with 200-300ms duration
          </p>
        </div>

        {/* Animation Variant Selector */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-lg p-6 mb-8 border-4 border-[#304B60] dark:border-[#D48161] transition-all duration-300">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4 transition-colors duration-300">
            Select Animation Variant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <button
                key={variant.name}
                onClick={() => setSelectedVariant(variant.name)}
                className={`p-4 rounded-xl font-bold transition-all duration-300 ${
                  selectedVariant === variant.name
                    ? 'bg-[#304B60] dark:bg-[#D48161] text-[#E3DAD1] dark:text-[#1a1a1a] scale-105'
                    : 'bg-[#E3DAD1] dark:bg-[#1a1a1a] text-[#304B60] dark:text-[#e0e0e0] hover:scale-105'
                } border-2 border-[#304B60] dark:border-[#D48161]`}
              >
                <div className="text-left">
                  <div className="text-lg">{variant.label}</div>
                  <div className="text-sm opacity-70">{variant.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Type Buttons */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-lg p-6 mb-8 border-4 border-[#304B60] dark:border-[#D48161] transition-all duration-300">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4 transition-colors duration-300">
            Test Modal Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modalTypes.map((modal) => (
              <button
                key={modal.id}
                onClick={() => openModal(modal.id)}
                className="p-6 rounded-xl font-bold text-lg bg-[#304B60] dark:bg-[#D48161] text-[#E3DAD1] dark:text-[#1a1a1a] hover:scale-105 transition-all duration-300 border-2 border-[#304B60] dark:border-[#D48161]"
              >
                Open {modal.title}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Info */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-lg p-6 border-4 border-[#304B60] dark:border-[#D48161] transition-all duration-300">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4 transition-colors duration-300">
            Animation Details
          </h2>
          <div className="space-y-3 text-[#304B60] dark:text-[#e0e0e0] transition-colors duration-300">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="font-bold">Duration: 200-300ms (smooth and responsive)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span className="font-bold">Easing: easeInOut (natural motion)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold">GPU-accelerated: transform & opacity only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♿</span>
              <span className="font-bold">Respects prefers-reduced-motion: {shouldAnimate ? 'No' : 'Yes'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span className="font-bold">Backdrop: 200ms fade (faster than content)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-bold">Content: 300ms {selectedVariant} animation</span>
            </div>
          </div>
        </div>

        {/* Demo Modal */}
        <AnimatePresence mode="wait">
          {activeModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
              onClick={closeModal}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={shouldAnimate ? modalVariants.backdrop : {}}
            >
              <motion.div
                className="bg-[#E3DAD1] dark:bg-[#2d2d2d] rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-[#304B60] dark:border-[#D48161] transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={shouldAnimate ? modalVariants[selectedVariant] : {}}
              >
                <h3 className="text-2xl font-black text-[#304B60] dark:text-[#e0e0e0] mb-4 transition-colors duration-300">
                  {modalTypes.find(m => m.id === activeModal)?.title}
                </h3>
                <p className="text-lg text-[#304B60]/80 dark:text-[#e0e0e0]/80 mb-6 transition-colors duration-300">
                  {modalTypes.find(m => m.id === activeModal)?.content}
                </p>
                <div className="bg-[#304B60]/10 dark:bg-[#D48161]/10 rounded-xl p-4 mb-6 transition-colors duration-300">
                  <p className="text-sm font-bold text-[#304B60] dark:text-[#e0e0e0] transition-colors duration-300">
                    Animation: {selectedVariant}
                  </p>
                  <p className="text-sm text-[#304B60]/70 dark:text-[#e0e0e0]/70 transition-colors duration-300">
                    Duration: {variants.find(v => v.name === selectedVariant)?.duration}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl font-bold bg-[#304B60] dark:bg-[#D48161] text-[#E3DAD1] dark:text-[#1a1a1a] hover:scale-105 transition-all duration-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl font-bold bg-[#E3DAD1] dark:bg-[#1a1a1a] text-[#304B60] dark:text-[#e0e0e0] border-2 border-[#304B60] dark:border-[#D48161] hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModalAnimationDemo;
