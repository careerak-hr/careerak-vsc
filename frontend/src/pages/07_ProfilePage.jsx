import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import userService from '../services/userService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Filesystem, Directory } from '@capacitor/filesystem';
import AlertModal from '../components/modals/AlertModal';
import ReportModal from '../components/modals/ReportModal';
import './07_ProfilePage.css';

export default function ProfilePage() {
  const { user, language, updateUser, logout, startBgMusic } = useAuth();
  const t = useTranslate();
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvGenerating, setCvGenerating] = useState(false);
  const [cvLevel, setCvLevel] = useState('intermediate');
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });
  const [showReportModal, setShowReportModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthDate: '', email: '', phone: '', country: '', city: '',
    permanentAddress: '', temporaryAddress: '', socialStatus: '', hasChildren: false,
    militaryStatus: '',
    healthStatus: { hasChronic: false, chronic: '', hasSkin: false, skin: '', hasInfectious: false, infectious: '', notes: '' },
    educationList: [], experienceList: [], trainingList: [],
    languages: [], computerSkills: [], softwareSkills: [], otherSkills: [],
    bio: ''
  });

  useEffect(() => {
    setIsVisible(true);
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    if (user) {
      setFormData({
        ...user,
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        healthStatus: user.healthStatus || { hasChronic: false, chronic: '', hasSkin: false, skin: '', hasInfectious: false, infectious: '', notes: '' },
        educationList: user.educationList || [],
        experienceList: user.experienceList || [],
        trainingList: user.trainingList || [],
        languages: user.languages || [],
        computerSkills: user.computerSkills || [],
        softwareSkills: user.softwareSkills || [],
        otherSkills: user.otherSkills || []
      });
    }
  }, [user, startBgMusic]);

  const profileT = t.profilePage;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      setIsEditing(false);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGenerateCv = async () => {
    setCvGenerating(true);
    try {
      const response = await userService.generateCv({ cvLevel });
      const fileUrl = response.data.url;
      const fileName = fileUrl.split('/').pop();
      await Filesystem.download(fileUrl, fileName, Directory.Documents);
      setAlertModal({ isOpen: true, message: profileT.cvSuccess });
    } catch (err) {
      console.error('Error generating or downloading CV:', err);
      setAlertModal({ isOpen: true, message: profileT.cvError });
    } finally {
      setCvGenerating(false);
    }
  };

  return (
    <div className={`profile-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="profile-page-main">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-image-container">
                <img src={user?.profileImage || "/logo.jpg"} alt="Profile" className="profile-image" />
              </div>
              <div className="profile-name-container">
                <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
                <p className="profile-role">{user?.role}</p>
              </div>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
                {profileT.edit} ✏️
              </button>
            )}
          </div>

          <div className="profile-body">
            <form className="profile-form">
              <section className="profile-section">
                <h3 className="profile-section-title">{profileT.personal}</h3>
                <div className="profile-grid">
                  <div>
                    <label className="profile-input-label">عنوان السكن الدائم</label>
                    {isEditing ? <input type="text" className="profile-input" value={formData.permanentAddress} onChange={e=>setFormData({...formData, permanentAddress:e.target.value})} /> : <p className="profile-display-text">{formData.permanentAddress || '---'}</p>}
                  </div>
                  <div>
                    <label className="profile-input-label">الحالة الاجتماعية</label>
                    {isEditing ? (
                      <select className="profile-input" value={formData.socialStatus} onChange={e=>setFormData({...formData, socialStatus:e.target.value})}>
                        {Object.entries(profileT.socialStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : <p className="profile-display-text">{profileT.socialStatuses[formData.socialStatus] || '---'}</p>}
                  </div>
                </div>
              </section>

              {isEditing && (
                <div className="profile-btn-group">
                  <button type="button" onClick={handleSave} disabled={loading} className="profile-save-btn">
                    {loading ? 'جاري الحفظ...' : profileT.save}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="profile-cancel-btn">{profileT.cancel}</button>
                </div>
              )}
            </form>

            <section className="profile-cv-section">
               <div className="profile-cv-content">
                  <div className="profile-cv-text-content">
                    <h3 className="profile-cv-title">✨ {profileT.aiCv}</h3>
                    <p className="profile-cv-subtitle">حول بياناتك إلى سيرة ذاتية احترافية بجودة PDF.</p>
                  </div>
                  <div className="profile-cv-controls">
                     <div className="profile-cv-level-selector">
                        {Object.entries(profileT.cvLevels).map(([k,v]) => (
                          <button key={k} onClick={()=>setCvLevel(k)} className={`profile-cv-level-btn ${cvLevel === k ? 'profile-cv-level-btn-active' : 'profile-cv-level-btn-inactive'}`}>{v}</button>
                        ))}
                     </div>
                     <button onClick={handleGenerateCv} disabled={cvGenerating} className="profile-cv-generate-btn">{cvGenerating ? profileT.generating : profileT.generateCv}</button>
                  </div>
               </div>
            </section>

            <div className="profile-logout-section">
              <button onClick={logout} className="profile-logout-btn">
                {profileT.logout} 🚪
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        language={language}
        t={t}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId={user?.id}
        targetName={user?.name}
      />
    </div>
  );
}