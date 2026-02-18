import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for password strength checking with lazy loading
 * Loads zxcvbn library only when needed (reduces initial bundle by 818KB)
 * 
 * @returns {Object} { strength, loading, checkStrength }
 */
export const usePasswordStrength = () => {
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);
  const zxcvbnRef = useRef(null);

  const checkStrength = useCallback(async (password) => {
    // Clear strength if password is empty
    if (!password || password.length === 0) {
      setStrength(null);
      return;
    }

    setLoading(true);
    
    try {
      // Load zxcvbn only once (cached after first load)
      if (!zxcvbnRef.current) {
        console.log('🔐 Loading zxcvbn library...');
        const module = await import('zxcvbn');
        zxcvbnRef.current = module.default;
        console.log('✅ zxcvbn loaded successfully');
      }

      // Check password strength
      const result = zxcvbnRef.current(password);
      
      setStrength({
        score: result.score, // 0-4 (0: very weak, 4: strong)
        feedback: result.feedback,
        crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
        warning: result.feedback.warning,
        suggestions: result.feedback.suggestions
      });
    } catch (error) {
      console.error('❌ Failed to load password strength checker:', error);
      
      // Fallback: assume weak password
      setStrength({
        score: 0,
        feedback: { warning: 'Unable to check password strength', suggestions: [] },
        crackTime: 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { strength, loading, checkStrength };
};
