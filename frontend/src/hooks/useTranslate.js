import { useAuth } from '../context/AuthContext';
import ar from '../i18n/ar.json';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';

const translations = { ar, en, fr };

export const useTranslate = () => {
  const { language } = useAuth();
  return translations[language] || translations.ar;
};
