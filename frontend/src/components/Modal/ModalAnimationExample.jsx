/**
 * Modal Animation Example
 * 
 * Demonstrates how to use modal animation variants (scaleIn, fade)
 * Created for task 4.3.1
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animationVariants';

/**
 * Example Modal with scaleIn animation
 */
export const ModalWithScaleIn = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with fade */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={modalVariants.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal content with scaleIn */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              variants={modalVariants.scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Example Modal with fade animation
 */
export const ModalWithFade = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with fade */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={modalVariants.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal content with simple fade */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              variants={modalVariants.fade}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Usage Example:
 * 
 * import { ModalWithScaleIn, ModalWithFade } from './components/Modal/ModalAnimationExample';
 * 
 * function MyComponent() {
 *   const [isOpen, setIsOpen] = useState(false);
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Open Modal</button>
 *       
 *       <ModalWithScaleIn isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *         <h2>Modal Title</h2>
 *         <p>Modal content goes here</p>
 *         <button onClick={() => setIsOpen(false)}>Close</button>
 *       </ModalWithScaleIn>
 *     </>
 *   );
 * }
 */

export default { ModalWithScaleIn, ModalWithFade };
