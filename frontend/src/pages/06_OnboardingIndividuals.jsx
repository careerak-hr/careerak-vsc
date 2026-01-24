import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function OnboardingIndividuals() {
  const navigate = useNavigate();
  const { language, updateUser, user: tempUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [isAgreed, setIsAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
  }, [tempUser]);

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

  const t = {
    ar: { 
      title: 'استكمال الملف الاحترافي ✨',
      cvMsg: 'إن رفعك لسيرتك الذاتية يوفر عليك من الجهد والوقت، وسنقوم بتحليلها واسقاط بياناتها هنا.',
      upload: 'ارفع السيرة الذاتية (PDF, Word, Excel, PPT)',
      parsing: 'جاري التحليل الذكي عبر AI... 🤖',
      personal: 'البيانات الشخصية والاجتماعية',
      health: 'الحالة الصحية',
      military: 'حالة التجنيد (للذكور)',
      education: 'المسيرة التعليمية',
      experience: 'المسيرة المهنية',
      training: 'المسيرة التدريبية',
      skills: 'اللغات والمهارات',
      add: '+ إضافة المزيد',
      finish: 'حفظ وتأكيد الملف',
      modalMsg: 'يرجى الموافقة على صحة البيانات أولاً',
      socialStatuses: { single: 'عازب', married: 'متزوج', divorced: 'مطلق', widowed: 'أرمل' },
      militaryStatuses: { exempt: 'معفى', performed: 'مؤداة', paid: 'دافع بدل نقدي', postponed: 'مؤجلة', in_service: 'في الخدمة' }
    }
  }[language || 'ar'];

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
            setFormData(prev => ({ ...prev, ...res.data.data, cvFile: base64 }));
        }
      } catch (err) {
        console.error("AI Parsing Failed", err);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addItem = (listName, defaultObj) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], defaultObj] }));
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
      navigate('/profile');
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-4 bg-[#E3DAD1] rounded-2xl border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-xs text-[#304B60] transition-all placeholder:text-gray-400 shadow-sm";
  const labelCls = "block text-[10px] font-black text-[#304B60]/60 mb-2 mr-2";

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-[#E3DAD1] pb-24 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      {showModal && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-6 bg-[#304B60]/40 backdrop-blur-sm">
          <div className="bg-[#E3DAD1] rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-2 border-[#304B60]/20">
            <p className="text-[#304B60] font-black text-lg mb-8">{t.modalMsg}</p>
            <button onClick={() => setShowModal(false)} className="w-full py-4 bg-[#304B60] text-[#D48161] rounded-[1.5rem] font-black shadow-lg">حسناً</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-[#E3DAD1] rounded-[3rem] shadow-2xl p-6 md:p-12 border-2 border-[#304B60]/5">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#304B60] mb-4">{t.title}</h2>
          <div className="bg-[#304B60]/5 p-6 rounded-3xl border-2 border-dashed border-[#D48161]/30">
            <label className="cursor-pointer block">
                <div className="text-4xl mb-2">📄</div>
                <p className="font-black text-[#304B60] text-sm mb-2">{fileName || t.upload}</p>
                <p className="text-[10px] text-[#304B60]/60 font-bold">{t.cvMsg}</p>
                <input type="file" className="hidden" onChange={handleCVUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            </label>
            {parsing && <div className="mt-4 animate-pulse text-[#304B60] font-black text-xs">{t.parsing}</div>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10">
             <div><label className={labelCls}>الاسم</label><p className="font-black text-[#304B60]">{formData.firstName} {formData.lastName}</p></div>
             <div><label className={labelCls}>الجنس</label><p className="font-black text-[#304B60]">{formData.gender === 'male' ? 'ذكر' : 'أنثى'}</p></div>
             <div><label className={labelCls}>التاريخ</label><p className="font-black text-[#304B60]">{formData.birthDate}</p></div>
             <div><label className={labelCls}>البلد</label><p className="font-black text-[#304B60]">{formData.country}</p></div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{t.personal}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="عنوان السكن الدائم" className={inputCls} value={formData.permanentAddress} onChange={e=>setFormData({...formData, permanentAddress:e.target.value})} />
                <input type="text" placeholder="عنوان السكن المؤقت" className={inputCls} value={formData.temporaryAddress} onChange={e=>setFormData({...formData, temporaryAddress:e.target.value})} />
                <select className={inputCls} value={formData.socialStatus} onChange={e=>setFormData({...formData, socialStatus:e.target.value})}>
                    <option value="">-- الحالة الاجتماعية --</option>
                    {Object.entries(t.socialStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex items-center gap-4 px-4 bg-[#304B60]/5 rounded-2xl border-2 border-[#D48161]/10 h-[56px]">
                    <span className="text-xs font-black text-[#304B60]">هل لديك أولاد؟</span>
                    <input type="checkbox" checked={formData.hasChildren} onChange={e=>setFormData({...formData, hasChildren:e.target.checked})} className="w-5 h-5 rounded accent-[#304B60]" />
                </div>
            </div>
          </section>

          {formData.gender === 'male' && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{t.military}</h3>
              <select className={inputCls} value={formData.militaryStatus} onChange={e=>setFormData({...formData, militaryStatus:e.target.value})}>
                <option value="">-- اختر الحالة --</option>
                {Object.entries(t.militaryStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{t.education}</h3>
            {formData.educationList.map((edu, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#304B60]/5 rounded-2xl border border-[#D48161]/10">
                    <input type="text" placeholder="المرحلة" className={inputCls} value={edu.level} onChange={e=>handleListChange('educationList', idx, 'level', e.target.value)} />
                    <input type="text" placeholder="الدرجة" className={inputCls} value={edu.degree} onChange={e=>handleListChange('educationList', idx, 'degree', e.target.value)} />
                    <input type="text" placeholder="الجهة" className={inputCls} value={edu.institution} onChange={e=>handleListChange('educationList', idx, 'institution', e.target.value)} />
                    <input type="text" placeholder="السنة" className={inputCls} value={edu.year} onChange={e=>handleListChange('educationList', idx, 'year', e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={()=>addItem('educationList', {level:'', degree:'', institution:'', city:'', country:'', year:'', grade:''})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{t.add}</button>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#304B60] border-r-4 border-[#D48161] pr-3">{t.experience}</h3>
            {formData.experienceList.map((exp, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-[#304B60]/5 rounded-3xl border border-[#D48161]/10">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="الشركة" className={inputCls} value={exp.company} onChange={e=>handleListChange('experienceList', idx, 'company', e.target.value)} />
                        <input type="text" placeholder="الوظيفة" className={inputCls} value={exp.position} onChange={e=>handleListChange('experienceList', idx, 'position', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" className={inputCls} value={exp.from} onChange={e=>handleListChange('experienceList', idx, 'from', e.target.value)} />
                        <input type="date" className={inputCls} value={exp.to} onChange={e=>handleListChange('experienceList', idx, 'to', e.target.value)} />
                    </div>
                    <textarea placeholder="المهام الوظيفية" className={`${inputCls} h-24 text-right`} value={exp.tasks} onChange={e=>handleListChange('experienceList', idx, 'tasks', e.target.value)} />
                </div>
            ))}
            <button type="button" onClick={()=>addItem('experienceList', {company:'', position:'', from:'', to:'', tasks:'', workType:'admin', jobLevel:'', reason:'', country:'', city:''})} className="text-[#304B60] font-black text-xs hover:text-[#D48161] transition-colors">{t.add}</button>
          </section>

          <div className="flex items-center gap-3 px-4">
            <input type="checkbox" checked={isAgreed} onChange={e=>setIsAgree(e.target.checked)} className="w-5 h-5 rounded accent-[#304B60]" />
            <p className="text-[10px] font-black text-[#304B60]/50">أقر بأن كافة البيانات المذكورة أعلاه صحيحة وتحت مسؤوليتي الشخصية.</p>
          </div>

          <button type="submit" disabled={loading || parsing} className="w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl text-xl active:scale-95 transition-all">
            {loading ? 'جاري الحفظ...' : t.finish}
          </button>
        </form>
      </div>
    </div>
  );
}
