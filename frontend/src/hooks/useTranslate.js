import { useApp } from '../context/AppContext'; // Corrected import

const useTranslate = (translations) => {
  const { language } = useApp(); // Corrected hook
  return translations[language] || translations.ar;
};

export default useTranslate;
