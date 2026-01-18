import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function OnboardingIndividuals() {
  const navigate = useNavigate();
  const { language, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAgreed, setIsAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const [formData, setFormData] = useState({
    bio: '',
    educationList: [{ degree: '', university: '', year: '' }],
    experienceList: [{ title: '', company: '', city: '', durationYears: '', durationMonths: '', tasks: '' }],
    skills: '',
    cvFile: null,
    linkedIn: '',
    facebook: ''
  });

  const t = {
    ar: { 
      title: 'بناء ملفك الاحترافي ✨', 
      sub: 'ضع روابطك أو ارفع سيرتك الذاتية، وسيقوم ذكاء كاريرك بتحليل كل شيء تلقائياً!',
      upload: 'ارفع السيرة الذاتية',
      parsing: 'جاري التحليل الذكي... 🤖',
      socialParsing: 'جاري استخراج بياناتك... 🔍',
      bio: 'نبذة تعريفية قصيرة',
      social: 'التواجد الرقمي (سيتم التحليل تلقائياً 🤖)',
      eduTitle: 'المسار الدراسي',
      expTitle: 'الخبرات العملية',
      addEdu: '+ إضافة مؤهل دراسي',
      addExp: '+ إضافة خبرة عملية',
      skills: 'المهارات الأساسية',
      declaration: 'أقر بأن كافة البيانات صحيحة وتحت مسؤوليتي الشخصية.',
      finish: 'إتمام الملف والبدء برحلة النجاح',
      modalMsg: 'يرجى الموافقة على صحة البيانات أولاً'
    },
    en: {
        title: 'Build Your Professional Profile ✨',
        sub: 'Paste links or upload CV, Careerak AI will handle everything automatically!',
        upload: 'Upload CV',
        parsing: 'AI is parsing... 🤖',
        socialParsing: 'Extracting data... 🔍',
        bio: 'Short Bio',
        social: 'Digital Presence (Auto-analyzed 🤖)',
        eduTitle: 'Education',
        expTitle: 'Work Experience',
        addEdu: '+ Add Education',
        addExp: '+ Add Experience',
        skills: 'Key Skills',
        declaration: 'I declare that all data is correct.',
        finish: 'Finish and Start',
        modalMsg: 'Please agree to declaration'
    }
  }[language || 'ar'];

  const autoAnalyzeSocial = async (platform, url) => {
    if (!url || !url.startsWith('http')) return;
    setSocialLoading(true);
    try {
      const res = await userService.parseSocial({ url, platform });
      const aiData = res.data.data;
      setFormData(prev => ({
        ...prev,
        bio: aiData.bio || prev.bio,
        skills: aiData.skills ? [...new Set([...prev.skills.split(','), ...aiData.skills])].join(',') : prev.skills,
        experienceList: aiData.experience || prev.experienceList
      }));
    } catch (err) {
      console.error("Auto analysis failed", err);
    } finally {
      setSocialLoading(false);
    }
  };

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
        const ai = res.data.data;
        setFormData(prev => ({
          ...prev,
          bio: ai.bio || prev.bio,
          educationList: ai.education || prev.educationList,
          experienceList: ai.experience || prev.experienceList,
          skills: ai.skills || prev.skills,
          cvFile: base64
        }));
      } catch (err) {
        setFormData(prev => ({ ...prev, cvFile: reader.result }));
      } finally {
        setParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) { setShowModal(true); return; }
    setLoading(true);
    setError('');
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-[#E3DAD0] pb-24 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {showModal && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full text-center shadow-2xl border-t-8 border-[#1A365D]">
            <p className="text-[#1A365D] font-black text-lg mb-8">{t.modalMsg}</p>
            <button onClick={() => setShowModal(false)} className="w-full py-4 bg-[#1A365D] text-white rounded-[1.5rem] font-black shadow-lg">حسناً</button>
          </div>
        </div>
      )}

      <div className={`max-w-3xl mx-auto bg-white rounded-[4rem] shadow-2xl p-8 md:p-16 border border-white transform transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#1A365D] mb-4 tracking-tight">{t.title}</h2>
          <p className="text-[#1A365D]/40 font-bold text-base italic">{t.sub}</p>
        </div>

        <label className={`mb-12 p-10 border-4 border-dashed rounded-[3.5rem] transition-all cursor-pointer block text-center ${fileName ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:bg-white shadow-inner'}`}>
          {parsing ? <div className="animate-pulse font-black text-[#1A365D]">{t.parsing}</div> : <p className="font-black text-[#1A365D] text-lg">{fileName || t.upload}</p>}
          <input type="file" className="hidden" onChange={handleCVUpload} accept=".pdf,.doc,.docx" />
        </label>

        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-[#1A365D] border-r-4 border-[#1A365D] pr-4">{t.social}</h3>
            {socialLoading && <p className="text-xs text-blue-600 animate-pulse font-black mb-2">{t.socialParsing}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="relative group">
                 <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">🔗</span>
                 <input 
                   type="url" 
                   value={formData.linkedIn} 
                   placeholder="LinkedIn URL" 
                   onChange={e => setFormData({...formData, linkedIn: e.target.value})} 
                   onBlur={() => autoAnalyzeSocial('linkedin', formData.linkedIn)}
                   className="w-full p-5 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-sm pr-14 border-2 border-transparent focus:border-[#1A365D]/20 focus:bg-white transition-all placeholder-gray-300 shadow-inner"
                 />
               </div>
               <div className="relative group">
                 <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">📘</span>
                 <input 
                   type="url" 
                   value={formData.facebook} 
                   placeholder="Facebook URL" 
                   onChange={e => setFormData({...formData, facebook: e.target.value})} 
                   onBlur={() => autoAnalyzeSocial('facebook', formData.facebook)}
                   className="w-full p-5 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-sm pr-14 border-2 border-transparent focus:border-[#1A365D]/20 focus:bg-white transition-all placeholder-gray-300 shadow-inner"
                 />
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-[#1A365D] border-r-4 border-[#1A365D] pr-4">{t.bio}</h3>
            <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-base h-32 shadow-inner border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white transition-all placeholder-gray-300" placeholder="سيتم تعبئتها تلقائياً عند إضافة روابطك..." />
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-[#1A365D] border-r-4 border-[#1A365D] pr-4">{t.skills}</h3>
            <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-base shadow-inner border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white transition-all placeholder-gray-300" placeholder="مثال: React, Python, القيادة..." />
          </section>

          <div className="flex items-center gap-3 px-4">
            <input type="checkbox" checked={isAgreed} onChange={e => setIsAgree(e.target.checked)} className="w-5 h-5 rounded-lg text-[#1A365D] focus:ring-[#1A365D]" />
            <p className="text-xs font-bold text-gray-400">{t.declaration}</p>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black text-center border border-red-100">{error}</div>}

          <button type="submit" disabled={loading || parsing || socialLoading} className="w-full py-7 rounded-[3rem] font-black shadow-2xl bg-[#1A365D] text-white text-2xl active:scale-95 transition-all">
            {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : t.finish}
          </button>
        </form>
      </div>
    </div>
  );
}
