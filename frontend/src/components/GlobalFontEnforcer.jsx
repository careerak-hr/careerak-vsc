
import { useEffect } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

/**
 * This component ensures the correct font family is applied to the body
 * based on the selected language.
 */
const GlobalFontEnforcer = () => {
  const { language } = useAppSettings();

  useEffect(() => {
    const body = document.body;
    switch (language) {
      case 'ar':
        body.style.fontFamily = '"Amiri", "Cairo", serif';
        break;
      case 'fr':
        body.style.fontFamily = '"EB Garamond", serif';
        break;
      case 'en':
      default:
        body.style.fontFamily = '"Cormorant Garamond", serif';
        break;
    }
  }, [language]);

  return null; // This component does not render anything
};

export default GlobalFontEnforcer;
