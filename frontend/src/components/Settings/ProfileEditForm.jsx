import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import './ProfileEditForm.css';

const ProfileEditForm = ({ onUpdate }) => {
  const { user, language, updateUser } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    language: user?.language || language || 'ar',
    timezone: user?.timezone || 'Asia/Riyadh',
  });

  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    ar: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      language: 'اللغة',
      timezone: 'المنطقة الزمنية',
      profilePicture: 'صورة الملف الشخصي',
      uploadImage: 'رفع صورة',
      changeImage: 'تغيير الصورة',
      cropImage: 'قص الصورة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      imageTooLarge: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
      invalidFormat: 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP',
      updateSuccess: 'تم تحديث الملف الشخصي بنجاح',
      updateError: 'فشل تحديث الملف الشخصي',
      namePlaceholder: 'أدخل اسمك',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      phonePlaceholder: 'أدخل رقم هاتفك',
    },
    en: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      language: 'Language',
      timezone: 'Timezone',
      profilePicture: 'Profile Picture',
      uploadImage: 'Upload Image',
      changeImage: 'Change Image',
      cropImage: 'Crop Image',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      imageTooLarge: 'Image too large. Maximum 5MB',
      invalidFormat: 'Invalid image format. Use JPG, PNG, or WebP',
      updateSuccess: 'Profile updated successfully',
      updateError: 'Failed to update profile',
      namePlaceholder: 'Enter your name',
      emailPlaceholder: 'Enter your email',
      phonePlaceholder: 'Enter your phone',
    },
    fr: {
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      language: 'Langue',
      timezone: 'Fuseau horaire',
      profilePicture: 'Photo de profil',
      uploadImage: 'Télécharger une image',
      changeImage: 'Changer l\'image',
      cropImage: 'Recadrer l\'image',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      imageTooLarge: 'Image trop grande. Maximum 5 Mo',
      invalidFormat: 'Format d\'image invalide. Utilisez JPG, PNG ou WebP',
      updateSuccess: 'Profil mis à jour avec succès',
      updateError: 'Échec de la mise à jour du profil',
      namePlaceholder: 'Entrez votre nom',
      emailPlaceholder: 'Entrez votre email',
      phonePlaceholder: 'Entrez votre téléphone',
    }
  };

  const t = translations[language] || translations.en;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onUpdate(false, t.imageTooLarge);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onUpdate(false, t.invalidFormat);
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfileImage(croppedImage);
      setShowCropper(false);
      setImageSrc(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      onUpdate(false, 'Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data
      const updateData = {
        ...formData,
        profilePicture: profileImage,
      };

      // Call API to update profile
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Update local user context
      if (updateUser) {
        updateUser(data.user);
      }

      onUpdate(true, t.updateSuccess);
    } catch (error) {
      console.error('Error updating profile:', error);
      onUpdate(false, t.updateError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      {/* Profile Picture */}
      <div className="form-group">
        <label className="form-label">{t.profilePicture}</label>
        <div className="profile-picture-section">
          <div className="profile-picture-preview">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-img" />
            ) : (
              <div className="profile-img-placeholder">
                <span>👤</span>
              </div>
            )}
          </div>
          <div className="profile-picture-actions">
            <input
              type="file"
              id="profile-image-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden-input"
            />
            <label htmlFor="profile-image-input" className="upload-btn">
              {profileImage ? t.changeImage : t.uploadImage}
            </label>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">{t.name}</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t.namePlaceholder}
          className="form-input"
          required
        />
      </div>

      {/* Email (Read-only, change via modal) */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">{t.email}</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          className="form-input"
          disabled
        />
        <p className="form-hint">Use "Change Email" button to update</p>
      </div>

      {/* Phone (Read-only, change via modal) */}
      <div className="form-group">
        <label htmlFor="phone" className="form-label">{t.phone}</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          className="form-input"
          disabled
        />
        <p className="form-hint">Use "Change Phone" button to update</p>
      </div>

      {/* Language */}
      <div className="form-group">
        <label htmlFor="language" className="form-label">{t.language}</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Timezone */}
      <div className="form-group">
        <label htmlFor="timezone" className="form-label">{t.timezone}</label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
          <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
          <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
          <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
          <option value="America/New_York">America/New_York (GMT-5)</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading}
      >
        {isLoading ? t.saving : t.save}
      </button>

      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <div className="cropper-header">
              <h3>{t.cropImage}</h3>
            </div>
            <div className="cropper-area">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="cropper-controls">
              <label className="zoom-label">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider"
              />
            </div>
            <div className="cropper-actions">
              <button
                type="button"
                onClick={handleCropCancel}
                className="cancel-btn"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="save-btn"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ProfileEditForm;
