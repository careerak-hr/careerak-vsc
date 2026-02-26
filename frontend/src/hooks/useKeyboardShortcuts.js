import { useEffect, useCallback } from 'react';

/**
 * useKeyboardShortcuts Hook
 * 
 * Manages keyboard shortcuts and their handlers
 * 
 * Parameters:
 * - shortcuts: Object mapping key combinations to handler functions
 *   Example: { 'ctrl+s': handleSave, '?': showHelp }
 * - enabled: Boolean to enable/disable shortcuts (default: true)
 * 
 * Returns: void
 * 
 * Usage:
 * useKeyboardShortcuts({
 *   'ctrl+s': handleSave,
 *   'ctrl+r': handleRefresh,
 *   '?': showHelp,
 *   'esc': closeModal
 * });
 */
const useKeyboardShortcuts = (shortcuts = {}, enabled = true) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Build the key combination string
    const keys = [];
    if (event.ctrlKey || event.metaKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    
    // Add the main key
    const mainKey = event.key.toLowerCase();
    if (!['control', 'alt', 'shift', 'meta'].includes(mainKey)) {
      keys.push(mainKey);
    }

    const combination = keys.join('+');

    // Check if this combination has a handler
    if (shortcuts[combination]) {
      // Prevent default browser behavior
      event.preventDefault();
      event.stopPropagation();
      
      // Call the handler
      shortcuts[combination](event);
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

export default useKeyboardShortcuts;
