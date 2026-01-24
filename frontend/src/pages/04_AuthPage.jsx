import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';

// Context & Services
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import countries from '../data/countries.json';

// Modals
import PhotoOptionsModal from '../components/modals/PhotoOptionsModal';
import CropModal from '../components/modals/CropModal';
import PolicyModal from '../components/modals/PolicyModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import AgeCheckModal from '../components/modals/AgeCheckModal';

// =======================
// Helpers
// =======================
const createCroppedImage = async (imageSrc, cropPixels) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const SIZE = 400;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    SIZE,
    SIZE
  );

  return canvas.toDataURL('image/jpeg', 0.8);
};

// =======================
// Component
// =======================
export default function AuthPage() {
  const { login: performContextLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  // -----------------------
  // UI / Visibility
  // -----------------------
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  // -----------------------
  // Form
  // -----------------------
  const [userType, setUserType] = useState('individuals');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    city: '',
    countryCode: '',
    education: '',
    specialization: '',
    interests: '',
    birthDate: '', // ✅ added by Waad – fix controlled input
    isSpecialNeeds: false,
    specialNeedType: '',
    industry: '',
    subIndustry: '',
    companyKeywords: '',
    authorizedName: '',
    authorizedPosition: ''
  });

  // -----------------------
  // Image & Crop
  // -----------------------
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // -----------------------
  // Modals
  // -----------------------
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showAgeCheck, setShowAgeCheck] = useState(false);
  const [ageKickMessage, setAgeKickMessage] = useState('');

  // =======================
  // Handlers
  // =======================
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name] || fieldErrors.api) setFieldErrors({});
  };

  const getPhoto = async source => {
    setShowPhotoModal(false);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source
      });
      setTempImage(`data:image/jpeg;base64,${image.base64String}`);
      setShowCropModal(true);
    } catch {}
  };

  const handleCropSave = async () => {
    const cropped = await createCroppedImage(tempImage, croppedAreaPixels);
    setProfileImage(cropped);
    setTempImage(null);
    setShowCropModal(false);
  };

  // =======================
  // Submit
  // =======================
  const handleRegisterClick = e => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  // =======================
  // Styles
  // =======================
  const inputBase =
    'w-full p-5 bg-white/60 rounded-[2rem] font-black text-center shadow-sm border-2 border-transparent focus:border-[#1A365D]/20 outline-none text-xs';

  // =======================
  // JSX
  // =======================
  return (
    <div
      className={`min-h-screen w-full flex justify-center p-4 bg-[#E3DAD0] transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      dir="rtl"
    >
      {/* ✅ added by Waad – main form wrapper to fix layout */}
      <form className="w-full max-w-md flex flex-col gap-4">
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={`${inputBase} text-gray-500`}
        >
          <option value="">-- {t.country} --</option>
          {countries.map(c => (
            <option key={c.name} value={c.name}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="interests"
          placeholder={t.interests}
          value={formData.interests}
          onChange={handleInputChange}
          className={`${inputBase} h-24`}
        />

        <input
          type="text"
          name="birthDate"
          placeholder={t.birthDate}
          value={formData.birthDate}
          onChange={handleInputChange}
          className={inputBase}
        />
      </form>

      {/* ================= MODALS ================= */}
      {showCropModal && (
        <CropModal
          image={tempImage}
          crop={crop}
          zoom={zoom}
          setCrop={setCrop}
          setZoom={setZoom}
          onCropComplete={onCropComplete}
          onSave={handleCropSave}
          onClose={() => setShowCropModal(false)}
        />
      )}

      {showPhotoModal && (
        <PhotoOptionsModal
          onSelectFromGallery={() => getPhoto(CameraSource.Photos)}
          onTakePhoto={() => getPhoto(CameraSource.Camera)}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {showPolicy && (
        <PolicyModal
          onClose={() => setShowPolicy(false)}
          onAgree={() => {
            setAgreed(true);
            setShowPolicy(false);
          }}
        />
      )}

      {showConfirmPopup && (
        <ConfirmationModal
          t={t}
          onConfirm={handleRegisterClick}
          onCancel={() => setShowConfirmPopup(false)}
        />
      )}

      {showAgeCheck && <AgeCheckModal t={t} onResponse={() => {}} />}

      {ageKickMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 text-white text-2xl font-black">
          {ageKickMessage}
        </div>
      )}
    </div>
  );
}
