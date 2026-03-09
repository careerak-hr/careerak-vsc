import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing undo stack
 * Keeps track of last N changes and allows undoing within a time window
 * 
 * @param {number} maxSize - Maximum number of changes to keep (default: 5)
 * @param {number} expiryTime - Time in milliseconds before changes expire (default: 30000ms = 30s)
 * @returns {Object} - { canUndo, undo, pushChange, clearStack, undoStack }
 */
const useUndoStack = (maxSize = 5, expiryTime = 30000) => {
  const [undoStack, setUndoStack] = useState([]);
  const timersRef = useRef([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  /**
   * Push a new change to the undo stack
   * @param {Object} change - { data, revertFunction, description }
   */
  const pushChange = useCallback((change) => {
    const timestamp = Date.now();
    const changeWithTimestamp = {
      ...change,
      timestamp,
      id: `${timestamp}-${Math.random()}`
    };

    setUndoStack(prevStack => {
      // Add new change
      let newStack = [...prevStack, changeWithTimestamp];

      // Keep only last maxSize changes
      if (newStack.length > maxSize) {
        newStack = newStack.slice(-maxSize);
      }

      return newStack;
    });

    // Set expiry timer
    const timer = setTimeout(() => {
      setUndoStack(prevStack => 
        prevStack.filter(item => item.id !== changeWithTimestamp.id)
      );
    }, expiryTime);

    timersRef.current.push(timer);

    // Cleanup old timers
    timersRef.current = timersRef.current.filter(t => t !== null);
  }, [maxSize, expiryTime]);

  /**
   * Undo the last change
   * @returns {Promise<Object>} - The undone change
   */
  const undo = useCallback(async () => {
    if (undoStack.length === 0) {
      throw new Error('لا توجد تغييرات للتراجع عنها');
    }

    // Get last change
    const lastChange = undoStack[undoStack.length - 1];

    // Check if expired
    const now = Date.now();
    if (now - lastChange.timestamp > expiryTime) {
      // Remove expired change
      setUndoStack(prevStack => prevStack.slice(0, -1));
      throw new Error('انتهت صلاحية التراجع (30 ثانية)');
    }

    try {
      // Call revert function
      if (lastChange.revertFunction) {
        await lastChange.revertFunction(lastChange.data);
      }

      // Remove from stack
      setUndoStack(prevStack => prevStack.slice(0, -1));

      return lastChange;
    } catch (error) {
      console.error('Undo error:', error);
      throw new Error('فشل التراجع عن التغيير');
    }
  }, [undoStack, expiryTime]);

  /**
   * Clear the entire undo stack
   */
  const clearStack = useCallback(() => {
    setUndoStack([]);
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  /**
   * Get time remaining for last change
   * @returns {number} - Milliseconds remaining, or 0 if no changes
   */
  const getTimeRemaining = useCallback(() => {
    if (undoStack.length === 0) return 0;
    
    const lastChange = undoStack[undoStack.length - 1];
    const elapsed = Date.now() - lastChange.timestamp;
    const remaining = expiryTime - elapsed;
    
    return Math.max(0, remaining);
  }, [undoStack, expiryTime]);

  return {
    canUndo: undoStack.length > 0,
    undo,
    pushChange,
    clearStack,
    undoStack,
    getTimeRemaining
  };
};

export default useUndoStack;
