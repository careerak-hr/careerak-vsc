/**
 * مكون معالجة زر الرجوع العام
 * Global Back Button Handler Component
 */

import { useSimpleBackButton } from '../hooks/useBackButton';

const BackButtonHandler = () => {
  // استخدام Hook لمعالجة زر الرجوع
  useSimpleBackButton();
  
  // هذا المكون لا يعرض أي شيء، فقط يدير زر الرجوع
  return null;
};

export default BackButtonHandler;
