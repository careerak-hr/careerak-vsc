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
    ar: { title: "نشر وظيفة جديدة", sub: "أضف تفاصيل الوظيفة لجذب أفضل الكفاءات", btn: "نشر الفرصة الآن" }
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
            <input type="text" placeholder="عنوان الوظيفة" className={inputCls} value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required />
            <textarea placeholder="الوصف الوظيفي" className={`${inputCls} h-32 resize-none`} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} required />
            <textarea placeholder="المتطلبات" className={`${inputCls} h-32 resize-none`} value={formData.requirements} onChange={e=>setFormData({...formData, requirements:e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="الموقع" className={inputCls} value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} />
               <select className={inputCls} value={formData.jobType} onChange={e=>setFormData({...formData, jobType:e.target.value})}>
                 <option value="Full Time">دوام كامل</option>
                 <option value="Part Time">دوام جزئي</option>
                 <option value="Remote">عن بعد</option>
                 <option value="Contract">عقد</option>
               </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all text-xl mt-4">
              {loading ? "جاري النشر..." : t.btn}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
