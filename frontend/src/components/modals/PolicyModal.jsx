import React from 'react';
import PolicyPage from '../../pages/14_PolicyPage'; // افترضت أن هذا هو المسار الصحيح

const PolicyModal = ({ onClose, onAgree }) => {
  return (
    <div className="fixed inset-0 z-50">
      <PolicyPage onClose={onClose} onAgree={onAgree} />
    </div>
  );
};
export default PolicyModal;
