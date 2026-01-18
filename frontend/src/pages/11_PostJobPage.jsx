import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function PostJobPage() {
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    // التحقق من الصلاحيات (HR أو Admin فقط)
    if (user && user.role !== 'HR' && user.role !== 'Admin') {
      navigate('/profile');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'Full-time',
    department: '',
    salary: { min: '', max: '' }
  });

  const t = {
    ar: {
      title: "نشر فرصة عمل جديدة",
      jobTitle: "عنوان الوظيفة",
      desc: "وصف الوظيفة والمسؤوليات",
      reqs: "المتطلبات والمهارات المطلوبة",
      loc: "موقع العمل (مدينة أو عن بعد)",
      dept: "القسم / التخصص",
      salaryMin: "الراتب الأدنى",
      salaryMax: "الراتب الأعلى",
      type: "نوع التوظيف",
      btn: "نشر الوظيفة الآن",
      success: "تم نشر الوظيفة بنجاح!"
    },
    en: {
      title: "Post New Job Opportunity",
      jobTitle: "Job Title",
      desc: "Job Description & Responsibilities",
      reqs: "Requirements & Skills",
      loc: "Location (City or Remote)",
      dept: "Department",
      salaryMin: "Min Salary",
      salaryMax: "Max Salary",
      type: "Employment Type",
      btn: "Post Job Now",
      success: "Job posted successfully!"
    }
  }[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/job-postings', formData);
      alert(t.success);
      navigate('/job-postings');
    } catch (err) {
      alert(isRTL ? 'خطأ في نشر الوظيفة' : 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-white">
          <h2 className={`text-3xl font-black text-[#1A365D] mb-10 border-[#1A365D] ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text" placeholder={t.jobTitle}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
              />
              <input
                type="text" placeholder={t.dept}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text" placeholder={t.loc}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <select
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner appearance-none"
                value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="number" placeholder={t.salaryMin}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.salary.min} onChange={(e) => setFormData({...formData, salary: {...formData.salary, min: e.target.value}})}
              />
              <input
                type="number" placeholder={t.salaryMax}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.salary.max} onChange={(e) => setFormData({...formData, salary: {...formData.salary, max: e.target.value}})}
              />
            </div>

            <textarea
              placeholder={t.desc}
              className="w-full p-6 bg-gray-50 rounded-[3rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner h-32"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
            />

            <textarea
              placeholder={t.reqs}
              className="w-full p-6 bg-gray-50 rounded-[3rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner h-32"
              value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A365D] text-white py-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-8"
            >
              {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : t.btn}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
