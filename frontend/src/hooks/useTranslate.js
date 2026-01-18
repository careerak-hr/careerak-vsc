import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';

export const useTranslate = () => {
  const { language } = useAuth();
  return translations[language] || translations.en;
};
