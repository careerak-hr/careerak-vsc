import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import './05_OnboardingIndividuals.css';

export default function OnboardingIndividuals() {
  const navigate = useNavigate();
  const { language, updateUser, user: tempUser, startBgMusic } = useAuth();
  const t = useTranslate();
  const onboardingT = t.onboardingIndividuals;
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [isAgreed, setIsAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    if (tempUser) {
      setFormData(prev => ({
        ...prev,
        firstName: tempUser.firstName || '',
        lastName: tempUser.lastName || '',
        gender: tempUser.gender || '',
        birthDate: tempUser.birthDate ? tempUser.birthDate.split('T')[0] : '',
        email: tempUser.email || '',
        phone: tempUser.phone || '',
        country: tempUser.country || '',
        city: tempUser.city || ''
      }));
    }
  }, [tempUser, startBgMusic]);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthDate: '', email: '', phone: '', country: '', city: '',
    permanentAddress: '', temporaryAddress: '', socialStatus: '', hasChildren: false,
    militaryStatus: '',
    healthStatus: { hasChronic: false, chronic: '', hasSkin: false, skin: '', hasInfectious: false, infectious: '', notes: '' },
    educationList: [{ level: '', degree: '', institution: '', city: '', country: '', year: '', grade: '' }],
    experienceList: [{ company: '', position: '', from: '', to: '', tasks: '', workType: 'admin', jobLevel: '', reason: '', country: '', city: '' }],
    trainingList: [{ courseName: '', provider: '', content: '', country: '', city: '', hasCert: true }],
    languages: [{ language: '', proficiency: 'intermediate' }],
    computerSkills: [{ skill: '', proficiency: 'intermediate' }],
    softwareSkills: [{ software: '', proficiency: 'intermediate' }],
    otherSkills: [''],
    bio: '', cvFile: null
  });

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setParsing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;
        const res = await userService.parseCV({ cvBase64: base64, fileName: file.name });
        
        if (res.data.data) {
          const parsedData = res.data.data;
          setFormData(prev => {
            const updated = { ...prev, cvFile: base64 };
            if (parsedData.firstName) updated.firstName = parsedData.firstName;
            if (parsedData.lastName) updated.lastName = parsedData.lastName;
            if (parsedData.email) updated.email = parsedData.email;
            if (parsedData.phone) updated.phone = parsedData.phone;
            if (parsedData.bio) updated.bio = parsedData.bio;
            if (parsedData.birthDate) updated.birthDate = parsedData.birthDate;
            if (parsedData.gender) updated.gender = parsedData.gender;
            if (parsedData.country) updated.country = parsedData.country;
            if (parsedData.city) updated.city = parsedData.city;
            if (parsedData.permanentAddress) updated.permanentAddress = parsedData.permanentAddress;
            if (parsedData.temporaryAddress) updated.temporaryAddress = parsedData.temporaryAddress;
            if (parsedData.socialStatus) updated.socialStatus = parsedData.socialStatus;
            if (parsedData.hasChildren !== undefined) updated.hasChildren = parsedData.hasChildren;
            if (parsedData.militaryStatus) updated.militaryStatus = parsedData.militaryStatus;
            if (parsedData.healthStatus) updated.healthStatus = { ...updated.healthStatus, ...parsedData.healthStatus };
            
            if (parsedData.educationList && Array.isArray(parsedData.educationList) && parsedData.educationList.length > 0) {
              const filteredExisting = prev.educationList.filter(edu => edu.level || edu.degree || edu.institution || edu.year);
              updated.educationList = [...filteredExisting, ...parsedData.educationList];
            }
            if (parsedData.experienceList && Array.isArray(parsedData.experienceList) && parsedData.experienceList.length > 0) {
              const filteredExisting = prev.experienceList.filter(exp => exp.company || exp.position || exp.from || exp.to);
              updated.experienceList = [...filteredExisting, ...parsedData.experienceList];
            }
            if (parsedData.trainingList && Array.isArray(parsedData.trainingList) && parsedData.trainingList.length > 0) {
              const filteredExisting = prev.trainingList.filter(training => training.courseName || training.provider || training.content);
              updated.trainingList = [...filteredExisting, ...parsedData.trainingList];
            }
            if (parsedData.languages && Array.isArray(parsedData.languages) && parsedData.languages.length > 0) {
              const filteredExisting = prev.languages.filter(lang => lang.language);
              updated.languages = [...filteredExisting, ...parsedData.languages];
            }
            if (parsedData.computerSkills && Array.isArray(parsedData.computerSkills) && parsedData.computerSkills.length > 0) {
              const filteredExisting = prev.computerSkills.filter(skill => skill.skill);
              updated.computerSkills = [...filteredExisting, ...parsedData.computerSkills];
            }
            if (parsedData.softwareSkills && Array.isArray(parsedData.softwareSkills) && parsedData.softwareSkills.length > 0) {
              const filteredExisting = prev.softwareSkills.filter(skill => skill.software);
              updated.softwareSkills = [...filteredExisting, ...parsedData.softwareSkills];
            }
            if (parsedData.otherSkills && Array.isArray(parsedData.otherSkills) && parsedData.otherSkills.length > 0) {
              const filteredExisting = prev.otherSkills.filter(skill => skill && skill.trim());
              const filteredNew = parsedData.otherSkills.filter(skill => skill && skill.trim());
              updated.otherSkills = [...filteredExisting, ...filteredNew];
            }
            return updated;
          });
          alert(onboardingT.cvParseSuccess || 'تم تحليل السيرة الذاتية وإسقاط البيانات بنجاح!');
        } else {
          alert(onboardingT.cvParseError || 'لم يتم العثور على بيانات قابلة للاستخراج في السيرة الذاتية');
        }
      } catch (err) {
        alert(onboardingT.cvParseError || 'حدث خطأ أثناء تحليل السيرة الذاتية. يرجى المحاولة مرة أخرى.');
      } finally {
        setParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addItem = (listName, defaultObj) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], defaultObj] }));
  };

  const removeItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  const handleListChange = (listName, index, field, value) => {
    const newList = [...formData[listName]];
    newList[index][field] = value;
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) { setShowModal(true); return; }
    setLoading(true);
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      navigate('/interface-individuals');
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className={`onboarding-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      {showModal && (
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleModalClose}
          message={onboardingT.modalMsg}
          confirmText={onboardingT.placeholders.ok}
          language={language}
        />
      )}

      <div className="onboarding-card">

        <div className="onboarding-header">
          <h2 className="onboarding-title">{onboardingT.title}</h2>
          <div className="onboarding-cv-upload-box">
            <label className="onboarding-cv-upload-label">
                <div className="onboarding-cv-icon">📄</div>
                <p className="onboarding-cv-text">{fileName || onboardingT.upload}</p>
                <p className="onboarding-cv-help-text">{onboardingT.cvMsg}</p>
                <input type="file" className="hidden" onChange={handleCVUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            </label>
            {parsing && <div className="onboarding-parsing-text">{onboardingT.parsing}</div>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">

          <section className="onboarding-summary-section">
             <div><label className="onboarding-label-base">{onboardingT.labels.name}</label><p>{formData.firstName} {formData.lastName}</p></div>
             <div><label className="onboarding-label-base">{onboardingT.labels.gender}</label><p>{onboardingT.genderOptions[formData.gender]}</p></div>
             <div><label className="onboarding-label-base">{onboardingT.labels.date}</label><p>{formData.birthDate}</p></div>
             <div><label className="onboarding-label-base">{onboardingT.labels.country}</label><p>{formData.country}</p></div>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.personal}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder={onboardingT.placeholders.permanentAddress} className="onboarding-input-base" value={formData.permanentAddress} onChange={e=>setFormData({...formData, permanentAddress:e.target.value})} />
                <input type="text" placeholder={onboardingT.placeholders.temporaryAddress} className="onboarding-input-base" value={formData.temporaryAddress} onChange={e=>setFormData({...formData, temporaryAddress:e.target.value})} />
                <select className="onboarding-input-base" value={formData.socialStatus} onChange={e=>setFormData({...formData, socialStatus:e.target.value})}>
                    <option value="">{onboardingT.placeholders.socialStatus}</option>
                    {Object.entries(onboardingT.socialStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="onboarding-checkbox-container">
                    <span className="onboarding-checkbox-label">{onboardingT.placeholders.hasChildren}</span>
                    <input type="checkbox" checked={formData.hasChildren} onChange={e=>setFormData({...formData, hasChildren:e.target.checked})} className="onboarding-checkbox" />
                </div>
            </div>
          </section>

          {formData.gender === 'male' && (
            <section className="onboarding-section">
              <h3 className="onboarding-section-title">{onboardingT.military}</h3>
              <select className="onboarding-input-base" value={formData.militaryStatus} onChange={e=>setFormData({...formData, militaryStatus:e.target.value})}>
                <option value="">{onboardingT.placeholders.militaryStatus}</option>
                {Object.entries(onboardingT.militaryStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </section>
          )}

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.education}</h3>
            {formData.educationList.map((edu, idx) => (
                <div key={idx} className="onboarding-list-item onboarding-list-item-grid">
                    <input type="text" placeholder={onboardingT.placeholders.level} className="onboarding-input-base" value={edu.level} onChange={e=>handleListChange('educationList', idx, 'level', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.degree} className="onboarding-input-base" value={edu.degree} onChange={e=>handleListChange('educationList', idx, 'degree', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.institution} className="onboarding-input-base" value={edu.institution} onChange={e=>handleListChange('educationList', idx, 'institution', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.year} className="onboarding-input-base" value={edu.year} onChange={e=>handleListChange('educationList', idx, 'year', e.target.value)} />
                    <button type="button" onClick={() => removeItem('educationList', idx)} className="onboarding-list-item-remove-btn">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('educationList', {level:'', degree:'', institution:'', city:'', country:'', year:'', grade:''})} className="onboarding-add-btn">{onboardingT.add}</button>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.experience}</h3>
            {formData.experienceList.map((exp, idx) => (
                <div key={idx} className="onboarding-list-item space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.company} className="onboarding-input-base" value={exp.company} onChange={e=>handleListChange('experienceList', idx, 'company', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.position} className="onboarding-input-base" value={exp.position} onChange={e=>handleListChange('experienceList', idx, 'position', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" className="onboarding-input-base" value={exp.from} onChange={e=>handleListChange('experienceList', idx, 'from', e.target.value)} />
                        <input type="date" className="onboarding-input-base" value={exp.to} onChange={e=>handleListChange('experienceList', idx, 'to', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.country || 'البلد'} className="onboarding-input-base" value={exp.country} onChange={e=>handleListChange('experienceList', idx, 'country', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.city || 'المدينة'} className="onboarding-input-base" value={exp.city} onChange={e=>handleListChange('experienceList', idx, 'city', e.target.value)} />
                    </div>
                    <textarea placeholder={onboardingT.placeholders.tasks} className="onboarding-input-base onboarding-textarea" value={exp.tasks} onChange={e=>handleListChange('experienceList', idx, 'tasks', e.target.value)} />
                    <button type="button" onClick={() => removeItem('experienceList', idx)} className="onboarding-list-item-remove-btn">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('experienceList', {company:'', position:'', from:'', to:'', tasks:'', workType:'admin', jobLevel:'', reason:'', country:'', city:''})} className="onboarding-add-btn">{onboardingT.add}</button>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.training || 'المسيرة التدريبية'}</h3>
            {formData.trainingList.map((training, idx) => (
                <div key={idx} className="onboarding-list-item space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.courseName || 'اسم الدورة'} className="onboarding-input-base" value={training.courseName} onChange={e=>handleListChange('trainingList', idx, 'courseName', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.provider || 'مقدم الدورة'} className="onboarding-input-base" value={training.provider} onChange={e=>handleListChange('trainingList', idx, 'provider', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.country || 'البلد'} className="onboarding-input-base" value={training.country} onChange={e=>handleListChange('trainingList', idx, 'country', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.city || 'المدينة'} className="onboarding-input-base" value={training.city} onChange={e=>handleListChange('trainingList', idx, 'city', e.target.value)} />
                    </div>
                    <textarea placeholder={onboardingT.placeholders.content || 'محتوى الدورة'} className="onboarding-input-base h-20 text-right" value={training.content} onChange={e=>handleListChange('trainingList', idx, 'content', e.target.value)} />
                    <div className="onboarding-checkbox-container">
                        <span className="onboarding-checkbox-label">{onboardingT.placeholders.hasCert || 'يوجد شهادة'}</span>
                        <input type="checkbox" checked={training.hasCert} onChange={e=>handleListChange('trainingList', idx, 'hasCert', e.target.checked)} className="onboarding-checkbox" />
                    </div>
                    <button type="button" onClick={() => removeItem('trainingList', idx)} className="onboarding-list-item-remove-btn">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('trainingList', {courseName:'', provider:'', content:'', country:'', city:'', hasCert:true})} className="onboarding-add-btn">{onboardingT.add}</button>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.health || 'الحالة الصحية'}</h3>
            <div className="onboarding-list-item space-y-4">
                <div className="onboarding-checkbox-container bg-white/50">
                    <span className="onboarding-checkbox-label">{onboardingT.placeholders.hasChronic || 'يوجد أمراض مزمنة'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasChronic} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasChronic:e.target.checked}})} className="onboarding-checkbox" />
                </div>
                {formData.healthStatus.hasChronic && (
                    <textarea placeholder={onboardingT.placeholders.chronic || 'تفاصيل الأمراض المزمنة'} className="onboarding-input-base h-20 text-right" value={formData.healthStatus.chronic} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, chronic:e.target.value}})} />
                )}
                
                <div className="onboarding-checkbox-container bg-white/50">
                    <span className="onboarding-checkbox-label">{onboardingT.placeholders.hasSkin || 'يوجد أمراض جلدية'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasSkin} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasSkin:e.target.checked}})} className="onboarding-checkbox" />
                </div>
                {formData.healthStatus.hasSkin && (
                    <textarea placeholder={onboardingT.placeholders.skin || 'تفاصيل الأمراض الجلدية'} className="onboarding-input-base h-20 text-right" value={formData.healthStatus.skin} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, skin:e.target.value}})} />
                )}
                
                <div className="onboarding-checkbox-container bg-white/50">
                    <span className="onboarding-checkbox-label">{onboardingT.placeholders.hasInfectious || 'يوجد أمراض معدية'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasInfectious} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasInfectious:e.target.checked}})} className="onboarding-checkbox" />
                </div>
                {formData.healthStatus.hasInfectious && (
                    <textarea placeholder={onboardingT.placeholders.infectious || 'تفاصيل الأمراض المعدية'} className="onboarding-input-base h-20 text-right" value={formData.healthStatus.infectious} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, infectious:e.target.value}})} />
                )}
                
                <textarea placeholder={onboardingT.placeholders.healthNotes || 'ملاحظات صحية إضافية'} className="onboarding-input-base h-20 text-right" value={formData.healthStatus.notes} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, notes:e.target.value}})} />
            </div>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.skills || 'اللغات والمهارات'}</h3>
            
            <div className="space-y-3">
                <h4 className="onboarding-subsection-title">{onboardingT.languages || 'اللغات'}</h4>
                {formData.languages.map((lang, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.language || 'اللغة'} className="onboarding-input-base" value={lang.language} onChange={e=>handleListChange('languages', idx, 'language', e.target.value)} />
                        <select className="onboarding-input-base" value={lang.proficiency} onChange={e=>handleListChange('languages', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="native">{onboardingT.proficiencyLevels?.native || 'لغة أم'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('languages', idx)} className="onboarding-list-item-remove-btn">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('languages', {language:'', proficiency:'intermediate'})} className="onboarding-add-btn">{onboardingT.add}</button>
            </div>

            <div className="space-y-3">
                <h4 className="onboarding-subsection-title">{onboardingT.computerSkills || 'مهارات الحاسوب'}</h4>
                {formData.computerSkills.map((skill, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.skill || 'المهارة'} className="onboarding-input-base" value={skill.skill} onChange={e=>handleListChange('computerSkills', idx, 'skill', e.target.value)} />
                        <select className="onboarding-input-base" value={skill.proficiency} onChange={e=>handleListChange('computerSkills', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="expert">{onboardingT.proficiencyLevels?.expert || 'خبير'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('computerSkills', idx)} className="onboarding-list-item-remove-btn">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('computerSkills', {skill:'', proficiency:'intermediate'})} className="onboarding-add-btn">{onboardingT.add}</button>
            </div>

            <div className="space-y-3">
                <h4 className="onboarding-subsection-title">{onboardingT.softwareSkills || 'مهارات البرمجيات'}</h4>
                {formData.softwareSkills.map((software, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.software || 'البرنامج'} className="onboarding-input-base" value={software.software} onChange={e=>handleListChange('softwareSkills', idx, 'software', e.target.value)} />
                        <select className="onboarding-input-base" value={software.proficiency} onChange={e=>handleListChange('softwareSkills', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="expert">{onboardingT.proficiencyLevels?.expert || 'خبير'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('softwareSkills', idx)} className="onboarding-list-item-remove-btn">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('softwareSkills', {software:'', proficiency:'intermediate'})} className="onboarding-add-btn">{onboardingT.add}</button>
            </div>

            <div className="space-y-3">
                <h4 className="onboarding-subsection-title">{onboardingT.otherSkills || 'مهارات أخرى'}</h4>
                {formData.otherSkills.map((skill, idx) => (
                    <div key={idx} className="p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.otherSkill || 'مهارة أخرى'} className="onboarding-input-base" value={skill} onChange={e=>{
                            const newSkills = [...formData.otherSkills];
                            newSkills[idx] = e.target.value;
                            setFormData({...formData, otherSkills: newSkills});
                        }} />
                        <button type="button" onClick={() => {
                            const newSkills = formData.otherSkills.filter((_, i) => i !== idx);
                            setFormData({...formData, otherSkills: newSkills});
                        }} className="onboarding-list-item-remove-btn">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>setFormData({...formData, otherSkills: [...formData.otherSkills, '']})} className="onboarding-add-btn">{onboardingT.add}</button>
            </div>
          </section>

          <section className="onboarding-section">
            <h3 className="onboarding-section-title">{onboardingT.bio || 'النبذة الشخصية'}</h3>
            <textarea placeholder={onboardingT.placeholders.bio || 'اكتب نبذة شخصية عنك وأهدافك المهنية'} className="onboarding-input-base h-32 text-right" value={formData.bio} onChange={e=>setFormData({...formData, bio:e.target.value})} />
          </section>

          <div className="onboarding-agreement-container">
            <input type="checkbox" checked={isAgreed} onChange={e=>setIsAgree(e.target.checked)} className="onboarding-checkbox" />
            <p className="onboarding-agreement-text">{onboardingT.placeholders.agreement}</p>
          </div>

          <button type="submit" disabled={loading || parsing} className="onboarding-submit-btn">
            {loading ? onboardingT.placeholders.loading : onboardingT.finish}
          </button>
        </form>
      </div>
    </div>
  );
}