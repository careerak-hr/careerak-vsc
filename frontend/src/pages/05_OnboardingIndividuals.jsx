import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import ConfirmationModal from '../components/modals/ConfirmationModal';

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
    
    // تشغيل الموسيقى الخلفية
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
        console.log('🔍 بدء تحليل السيرة الذاتية:', file.name);
        
        const res = await userService.parseCV({ cvBase64: base64, fileName: file.name });
        
        if (res.data.data) {
          const parsedData = res.data.data;
          console.log('✅ تم تحليل السيرة الذاتية بنجاح:', parsedData);
          
          setFormData(prev => {
            const updated = { ...prev, cvFile: base64 };
            
            // تحديث البيانات الأساسية
            if (parsedData.firstName) {
              updated.firstName = parsedData.firstName;
              console.log('📝 تم تحديث الاسم الأول:', parsedData.firstName);
            }
            if (parsedData.lastName) {
              updated.lastName = parsedData.lastName;
              console.log('📝 تم تحديث الاسم الأخير:', parsedData.lastName);
            }
            if (parsedData.email) {
              updated.email = parsedData.email;
              console.log('📧 تم تحديث البريد الإلكتروني:', parsedData.email);
            }
            if (parsedData.phone) {
              updated.phone = parsedData.phone;
              console.log('📞 تم تحديث رقم الهاتف:', parsedData.phone);
            }
            if (parsedData.bio) {
              updated.bio = parsedData.bio;
              console.log('📄 تم تحديث النبذة الشخصية');
            }
            if (parsedData.birthDate) {
              updated.birthDate = parsedData.birthDate;
              console.log('📅 تم تحديث تاريخ الميلاد:', parsedData.birthDate);
            }
            if (parsedData.gender) {
              updated.gender = parsedData.gender;
              console.log('👤 تم تحديث الجنس:', parsedData.gender);
            }
            if (parsedData.country) {
              updated.country = parsedData.country;
              console.log('🌍 تم تحديث البلد:', parsedData.country);
            }
            if (parsedData.city) {
              updated.city = parsedData.city;
              console.log('🏙️ تم تحديث المدينة:', parsedData.city);
            }
            
            // تحديث البيانات الشخصية والاجتماعية
            if (parsedData.permanentAddress) {
              updated.permanentAddress = parsedData.permanentAddress;
              console.log('🏠 تم تحديث العنوان الدائم');
            }
            if (parsedData.temporaryAddress) {
              updated.temporaryAddress = parsedData.temporaryAddress;
              console.log('🏠 تم تحديث العنوان المؤقت');
            }
            if (parsedData.socialStatus) {
              updated.socialStatus = parsedData.socialStatus;
              console.log('👨‍👩‍👧‍👦 تم تحديث الحالة الاجتماعية:', parsedData.socialStatus);
            }
            if (parsedData.hasChildren !== undefined) {
              updated.hasChildren = parsedData.hasChildren;
              console.log('👶 تم تحديث حالة الأطفال:', parsedData.hasChildren);
            }
            if (parsedData.militaryStatus) {
              updated.militaryStatus = parsedData.militaryStatus;
              console.log('🎖️ تم تحديث الحالة العسكرية:', parsedData.militaryStatus);
            }
            
            // تحديث الحالة الصحية
            if (parsedData.healthStatus) {
              updated.healthStatus = {
                ...updated.healthStatus,
                ...parsedData.healthStatus
              };
              console.log('🏥 تم تحديث الحالة الصحية');
            }
            
            // دمج قائمة التعليم
            if (parsedData.educationList && Array.isArray(parsedData.educationList) && parsedData.educationList.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.educationList.filter(edu => 
                edu.level || edu.degree || edu.institution || edu.year
              );
              updated.educationList = [...filteredExisting, ...parsedData.educationList];
              console.log('🎓 تم دمج قائمة التعليم:', parsedData.educationList.length, 'عنصر');
            }
            
            // دمج قائمة الخبرات
            if (parsedData.experienceList && Array.isArray(parsedData.experienceList) && parsedData.experienceList.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.experienceList.filter(exp => 
                exp.company || exp.position || exp.from || exp.to
              );
              updated.experienceList = [...filteredExisting, ...parsedData.experienceList];
              console.log('💼 تم دمج قائمة الخبرات:', parsedData.experienceList.length, 'عنصر');
            }
            
            // دمج قائمة التدريب
            if (parsedData.trainingList && Array.isArray(parsedData.trainingList) && parsedData.trainingList.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.trainingList.filter(training => 
                training.courseName || training.provider || training.content
              );
              updated.trainingList = [...filteredExisting, ...parsedData.trainingList];
              console.log('📚 تم دمج قائمة التدريب:', parsedData.trainingList.length, 'عنصر');
            }
            
            // دمج قائمة اللغات
            if (parsedData.languages && Array.isArray(parsedData.languages) && parsedData.languages.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.languages.filter(lang => lang.language);
              updated.languages = [...filteredExisting, ...parsedData.languages];
              console.log('🌐 تم دمج قائمة اللغات:', parsedData.languages.length, 'عنصر');
            }
            
            // دمج مهارات الحاسوب
            if (parsedData.computerSkills && Array.isArray(parsedData.computerSkills) && parsedData.computerSkills.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.computerSkills.filter(skill => skill.skill);
              updated.computerSkills = [...filteredExisting, ...parsedData.computerSkills];
              console.log('💻 تم دمج مهارات الحاسوب:', parsedData.computerSkills.length, 'عنصر');
            }
            
            // دمج مهارات البرمجيات
            if (parsedData.softwareSkills && Array.isArray(parsedData.softwareSkills) && parsedData.softwareSkills.length > 0) {
              // إزالة العنصر الفارغ الافتراضي إذا كان موجوداً
              const filteredExisting = prev.softwareSkills.filter(skill => skill.software);
              updated.softwareSkills = [...filteredExisting, ...parsedData.softwareSkills];
              console.log('🛠️ تم دمج مهارات البرمجيات:', parsedData.softwareSkills.length, 'عنصر');
            }
            
            // دمج المهارات الأخرى
            if (parsedData.otherSkills && Array.isArray(parsedData.otherSkills) && parsedData.otherSkills.length > 0) {
              // إزالة العناصر الفارغة الافتراضية
              const filteredExisting = prev.otherSkills.filter(skill => skill && skill.trim());
              const filteredNew = parsedData.otherSkills.filter(skill => skill && skill.trim());
              updated.otherSkills = [...filteredExisting, ...filteredNew];
              console.log('🎯 تم دمج المهارات الأخرى:', filteredNew.length, 'عنصر');
            }
            
            console.log('🎉 تم إسقاط جميع البيانات بنجاح في النموذج');
            return updated;
          });
          
          // إظهار رسالة نجاح للمستخدم
          alert(onboardingT.cvParseSuccess || 'تم تحليل السيرة الذاتية وإسقاط البيانات بنجاح!');
          
        } else {
          console.warn('⚠️ لم يتم العثور على بيانات في الاستجابة');
          alert(onboardingT.cvParseError || 'لم يتم العثور على بيانات قابلة للاستخراج في السيرة الذاتية');
        }
      } catch (err) {
        console.error("❌ فشل تحليل السيرة الذاتية:", err);
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

  const inputCls = "w-full p-4 bg-[#E3DAD1] rounded-2xl border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-xs text-[#304B60] transition-all placeholder:text-gray-400 shadow-sm";
  const labelCls = "block text-[10px] font-black text-[#304B60]/60 mb-2 mr-2";

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-[#E3DAD1] pb-24 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      {showModal && (
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleModalClose}
          message={onboardingT.modalMsg}
          confirmText={onboardingT.placeholders.ok}
          language={language}
        />
      )}

      <div className="max-w-4xl mx-auto bg-[#E3DAD1] rounded-[3rem] shadow-2xl p-6 md:p-12 border-2 border-[#304B60]/5">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#304B60] mb-4">{onboardingT.title}</h2>
          <div className="bg-[#304B60]/5 p-6 rounded-3xl border-2 border-dashed border-[#D48161]/30">
            <label className="cursor-pointer block">
                <div className="text-4xl mb-2">📄</div>
                <p className="font-black text-[#304B60] text-sm mb-2">{fileName || onboardingT.upload}</p>
                <p className="text-[10px] text-[#304B60]/60 font-bold">{onboardingT.cvMsg}</p>
                <input type="file" className="hidden" onChange={handleCVUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            </label>
            {parsing && <div className="mt-4 animate-pulse text-[#304B60] font-black text-xs">{onboardingT.parsing}</div>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10">
             <div><label className={labelCls}>{onboardingT.labels.name}</label><p className="font-black text-[#304B60]">{formData.firstName} {formData.lastName}</p></div>
             <div><label className={labelCls}>{onboardingT.labels.gender}</label><p className="font-black text-[#304B60]">{onboardingT.genderOptions[formData.gender]}</p></div>
             <div><label className={labelCls}>{onboardingT.labels.date}</label><p className="font-black text-[#304B60]">{formData.birthDate}</p></div>
             <div><label className={labelCls}>{onboardingT.labels.country}</label><p className="font-black text-[#304B60]">{formData.country}</p></div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.personal}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder={onboardingT.placeholders.permanentAddress} className={inputCls} value={formData.permanentAddress} onChange={e=>setFormData({...formData, permanentAddress:e.target.value})} />
                <input type="text" placeholder={onboardingT.placeholders.temporaryAddress} className={inputCls} value={formData.temporaryAddress} onChange={e=>setFormData({...formData, temporaryAddress:e.target.value})} />
                <select className={inputCls} value={formData.socialStatus} onChange={e=>setFormData({...formData, socialStatus:e.target.value})}>
                    <option value="">{onboardingT.placeholders.socialStatus}</option>
                    {Object.entries(onboardingT.socialStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex items-center gap-4 px-4 bg-[#304B60]/5 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                    <span className="text-xs font-black text-[#304B60]">{onboardingT.placeholders.hasChildren}</span>
                    <input type="checkbox" checked={formData.hasChildren} onChange={e=>setFormData({...formData, hasChildren:e.target.checked})} className="w-5 h-5 rounded accent-[#304B60]" />
                </div>
            </div>
          </section>

          {formData.gender === 'male' && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.military}</h3>
              <select className={inputCls} value={formData.militaryStatus} onChange={e=>setFormData({...formData, militaryStatus:e.target.value})}>
                <option value="">{onboardingT.placeholders.militaryStatus}</option>
                {Object.entries(onboardingT.militaryStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.education}</h3>
            {formData.educationList.map((edu, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                    <input type="text" placeholder={onboardingT.placeholders.level} className={inputCls} value={edu.level} onChange={e=>handleListChange('educationList', idx, 'level', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.degree} className={inputCls} value={edu.degree} onChange={e=>handleListChange('educationList', idx, 'degree', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.institution} className={inputCls} value={edu.institution} onChange={e=>handleListChange('educationList', idx, 'institution', e.target.value)} />
                    <input type="text" placeholder={onboardingT.placeholders.year} className={inputCls} value={edu.year} onChange={e=>handleListChange('educationList', idx, 'year', e.target.value)} />
                    <button type="button" onClick={() => removeItem('educationList', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('educationList', {level:'', degree:'', institution:'', city:'', country:'', year:'', grade:''})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.experience}</h3>
            {formData.experienceList.map((exp, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10 relative">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.company} className={inputCls} value={exp.company} onChange={e=>handleListChange('experienceList', idx, 'company', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.position} className={inputCls} value={exp.position} onChange={e=>handleListChange('experienceList', idx, 'position', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" className={inputCls} value={exp.from} onChange={e=>handleListChange('experienceList', idx, 'from', e.target.value)} />
                        <input type="date" className={inputCls} value={exp.to} onChange={e=>handleListChange('experienceList', idx, 'to', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.country || 'البلد'} className={inputCls} value={exp.country} onChange={e=>handleListChange('experienceList', idx, 'country', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.city || 'المدينة'} className={inputCls} value={exp.city} onChange={e=>handleListChange('experienceList', idx, 'city', e.target.value)} />
                    </div>
                    <textarea placeholder={onboardingT.placeholders.tasks} className={`${inputCls} h-24 text-right`} value={exp.tasks} onChange={e=>handleListChange('experienceList', idx, 'tasks', e.target.value)} />
                    <button type="button" onClick={() => removeItem('experienceList', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('experienceList', {company:'', position:'', from:'', to:'', tasks:'', workType:'admin', jobLevel:'', reason:'', country:'', city:''})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.training || 'المسيرة التدريبية'}</h3>
            {formData.trainingList.map((training, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10 relative">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.courseName || 'اسم الدورة'} className={inputCls} value={training.courseName} onChange={e=>handleListChange('trainingList', idx, 'courseName', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.provider || 'مقدم الدورة'} className={inputCls} value={training.provider} onChange={e=>handleListChange('trainingList', idx, 'provider', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder={onboardingT.placeholders.country || 'البلد'} className={inputCls} value={training.country} onChange={e=>handleListChange('trainingList', idx, 'country', e.target.value)} />
                        <input type="text" placeholder={onboardingT.placeholders.city || 'المدينة'} className={inputCls} value={training.city} onChange={e=>handleListChange('trainingList', idx, 'city', e.target.value)} />
                    </div>
                    <textarea placeholder={onboardingT.placeholders.content || 'محتوى الدورة'} className={`${inputCls} h-20 text-right`} value={training.content} onChange={e=>handleListChange('trainingList', idx, 'content', e.target.value)} />
                    <div className="flex items-center gap-4 px-4 bg-[#304B60]/5 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                        <span className="text-xs font-black text-[#304B60]">{onboardingT.placeholders.hasCert || 'يوجد شهادة'}</span>
                        <input type="checkbox" checked={training.hasCert} onChange={e=>handleListChange('trainingList', idx, 'hasCert', e.target.checked)} className="w-5 h-5 rounded accent-[#304B60]" />
                    </div>
                    <button type="button" onClick={() => removeItem('trainingList', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                </div>
            ))}
            <button type="button" onClick={()=>addItem('trainingList', {courseName:'', provider:'', content:'', country:'', city:'', hasCert:true})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.health || 'الحالة الصحية'}</h3>
            <div className="p-4 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10 space-y-4">
                <div className="flex items-center gap-4 px-4 bg-white/50 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                    <span className="text-xs font-black text-[#304B60]">{onboardingT.placeholders.hasChronic || 'يوجد أمراض مزمنة'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasChronic} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasChronic:e.target.checked}})} className="w-5 h-5 rounded accent-[#304B60]" />
                </div>
                {formData.healthStatus.hasChronic && (
                    <textarea placeholder={onboardingT.placeholders.chronic || 'تفاصيل الأمراض المزمنة'} className={`${inputCls} h-20 text-right`} value={formData.healthStatus.chronic} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, chronic:e.target.value}})} />
                )}
                
                <div className="flex items-center gap-4 px-4 bg-white/50 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                    <span className="text-xs font-black text-[#304B60]">{onboardingT.placeholders.hasSkin || 'يوجد أمراض جلدية'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasSkin} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasSkin:e.target.checked}})} className="w-5 h-5 rounded accent-[#304B60]" />
                </div>
                {formData.healthStatus.hasSkin && (
                    <textarea placeholder={onboardingT.placeholders.skin || 'تفاصيل الأمراض الجلدية'} className={`${inputCls} h-20 text-right`} value={formData.healthStatus.skin} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, skin:e.target.value}})} />
                )}
                
                <div className="flex items-center gap-4 px-4 bg-white/50 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                    <span className="text-xs font-black text-[#304B60]">{onboardingT.placeholders.hasInfectious || 'يوجد أمراض معدية'}</span>
                    <input type="checkbox" checked={formData.healthStatus.hasInfectious} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, hasInfectious:e.target.checked}})} className="w-5 h-5 rounded accent-[#304B60]" />
                </div>
                {formData.healthStatus.hasInfectious && (
                    <textarea placeholder={onboardingT.placeholders.infectious || 'تفاصيل الأمراض المعدية'} className={`${inputCls} h-20 text-right`} value={formData.healthStatus.infectious} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, infectious:e.target.value}})} />
                )}
                
                <textarea placeholder={onboardingT.placeholders.healthNotes || 'ملاحظات صحية إضافية'} className={`${inputCls} h-20 text-right`} value={formData.healthStatus.notes} onChange={e=>setFormData({...formData, healthStatus:{...formData.healthStatus, notes:e.target.value}})} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.skills || 'اللغات والمهارات'}</h3>
            
            {/* اللغات */}
            <div className="space-y-3">
                <h4 className="text-md font-black text-[#304B60] border-r-2 border-[#D48161] pr-2">{onboardingT.languages || 'اللغات'}</h4>
                {formData.languages.map((lang, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.language || 'اللغة'} className={inputCls} value={lang.language} onChange={e=>handleListChange('languages', idx, 'language', e.target.value)} />
                        <select className={inputCls} value={lang.proficiency} onChange={e=>handleListChange('languages', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="native">{onboardingT.proficiencyLevels?.native || 'لغة أم'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('languages', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('languages', {language:'', proficiency:'intermediate'})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
            </div>

            {/* مهارات الحاسوب */}
            <div className="space-y-3">
                <h4 className="text-md font-black text-[#304B60] border-r-2 border-[#D48161] pr-2">{onboardingT.computerSkills || 'مهارات الحاسوب'}</h4>
                {formData.computerSkills.map((skill, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.skill || 'المهارة'} className={inputCls} value={skill.skill} onChange={e=>handleListChange('computerSkills', idx, 'skill', e.target.value)} />
                        <select className={inputCls} value={skill.proficiency} onChange={e=>handleListChange('computerSkills', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="expert">{onboardingT.proficiencyLevels?.expert || 'خبير'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('computerSkills', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('computerSkills', {skill:'', proficiency:'intermediate'})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
            </div>

            {/* مهارات البرمجيات */}
            <div className="space-y-3">
                <h4 className="text-md font-black text-[#304B60] border-r-2 border-[#D48161] pr-2">{onboardingT.softwareSkills || 'مهارات البرمجيات'}</h4>
                {formData.softwareSkills.map((software, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.software || 'البرنامج'} className={inputCls} value={software.software} onChange={e=>handleListChange('softwareSkills', idx, 'software', e.target.value)} />
                        <select className={inputCls} value={software.proficiency} onChange={e=>handleListChange('softwareSkills', idx, 'proficiency', e.target.value)}>
                            <option value="beginner">{onboardingT.proficiencyLevels?.beginner || 'مبتدئ'}</option>
                            <option value="intermediate">{onboardingT.proficiencyLevels?.intermediate || 'متوسط'}</option>
                            <option value="advanced">{onboardingT.proficiencyLevels?.advanced || 'متقدم'}</option>
                            <option value="expert">{onboardingT.proficiencyLevels?.expert || 'خبير'}</option>
                        </select>
                        <button type="button" onClick={() => removeItem('softwareSkills', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>addItem('softwareSkills', {software:'', proficiency:'intermediate'})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
            </div>

            {/* المهارات الأخرى */}
            <div className="space-y-3">
                <h4 className="text-md font-black text-[#304B60] border-r-2 border-[#D48161] pr-2">{onboardingT.otherSkills || 'مهارات أخرى'}</h4>
                {formData.otherSkills.map((skill, idx) => (
                    <div key={idx} className="p-3 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10 relative">
                        <input type="text" placeholder={onboardingT.placeholders.otherSkill || 'مهارة أخرى'} className={inputCls} value={skill} onChange={e=>{
                            const newSkills = [...formData.otherSkills];
                            newSkills[idx] = e.target.value;
                            setFormData({...formData, otherSkills: newSkills});
                        }} />
                        <button type="button" onClick={() => {
                            const newSkills = formData.otherSkills.filter((_, i) => i !== idx);
                            setFormData({...formData, otherSkills: newSkills});
                        }} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-black text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={()=>setFormData({...formData, otherSkills: [...formData.otherSkills, '']})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{onboardingT.add}</button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{onboardingT.bio || 'النبذة الشخصية'}</h3>
            <textarea placeholder={onboardingT.placeholders.bio || 'اكتب نبذة شخصية عنك وأهدافك المهنية'} className={`${inputCls} h-32 text-right`} value={formData.bio} onChange={e=>setFormData({...formData, bio:e.target.value})} />
          </section>

          <div className="flex items-center gap-3 px-4">
            <input type="checkbox" checked={isAgreed} onChange={e=>setIsAgree(e.target.checked)} className="w-5 h-5 rounded accent-[#304B60]" />
            <p className="text-[10px] font-black text-[#304B60]/50">{onboardingT.placeholders.agreement}</p>
          </div>

          <button type="submit" disabled={loading || parsing} className="w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl text-xl active:scale-95 transition-all">
            {loading ? onboardingT.placeholders.loading : onboardingT.finish}
          </button>
        </form>
      </div>
    </div>
  );
}
