import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function PostJobPage() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const [formData, setFormData] = useState({
    title: '', description: '', requirements: '', location: '', jobType: 'Full Time', salary: { min: '', max: '' }
  });

  const t = {
    ar: { 
      title: "نشر وظيفة جديدة", 
      sub: "أضف تفاصيل الوظيفة لجذب أفضل الكفاءات", 
      btn: "نشر الفرصة الآن",
      placeholders: {
        title: "عنوان الوظيفة",
        description: "الوصف الوظيفي",
        requirements: "المتطلبات",
        location: "الموقع"
      },
      options: {
        fullTime: "دوام كامل",
        partTime: "دوام جزئي",
        remote: "عن بعد",
        contract: "عقد"
      },
      loading: "جاري النشر..."
    },
    en: { 
      title: "Post a New Job", 
      sub: "Add job details to attract the best talents", 
      btn: "Post Opportunity Now",
      placeholders: {
        title: "Job Title",
        description: "Job Description",
        requirements: "Requirements",
        location: "Location"
      },
      options: {
        fullTime: "Full Time",
        partTime: "Part Time",
        remote: "Remote",
        contract: "Contract"
      },
      loading: "Publishing..."
    },
    fr: { 
      title: "Publier un nouvel emploi", 
      sub: "Ajoutez les détails de l'emploi pour attirer les meilleurs talents", 
      btn: "Publier l'opportunité maintenant",
      placeholders: {
        title: "Titre du poste",
        description: "Description du poste",
        requirements: "Exigences",
        location: "Emplacement"
      },
      options: {
        fullTime: "Temps plein",
        partTime: "Temps partiel",
        remote: "Télétravail",
        contract: "Contrat"
      },
      loading: "Publication en cours..."
    }
  }[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/job-postings', formData);
      navigate('/job-postings');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const inputCls = "w-full p-5 bg-[#E3DAD1] rounded-[2rem] outline-none font-black text-[#304B60] placeholder:text-gray-400 border-2 border-[#D48161]/20 focus:border-[#D48161] shadow-sm";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] py-24 pb-32 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4">
        <div className="bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-10 border-2 border-[#304B60]/5">
          <h2 className="text-3xl font-black text-[#304B60] mb-2 italic text-center">{t.title}</h2>
          <p className="text-[#304B60]/40 font-bold text-center mb-10">{t.sub}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" placeholder={t.placeholders.title} className={inputCls} value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required />
            <textarea placeholder={t.placeholders.description} className={`${inputCls} h-32 resize-none`} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} required />
            <textarea placeholder={t.placeholders.requirements} className={`${inputCls} h-32 resize-none`} value={formData.requirements} onChange={e=>setFormData({...formData, requirements:e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder={t.placeholders.location} className={inputCls} value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} />
               <select className={inputCls} value={formData.jobType} onChange={e=>setFormData({...formData, jobType:e.target.value})}>
                 <option value="Full Time">{t.options.fullTime}</option>
                 <option value="Part Time">{t.options.partTime}</option>
                 <option value="Remote">{t.options.remote}</option>
                 <option value="Contract">{t.options.contract}</option>
               </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all text-xl mt-4">
              {loading ? t.loading : t.btn}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
