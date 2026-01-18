import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function ApplyPage() {
  const { jobId } = useParams();
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    const fetchJob = async () => {
      try {
        const res = await api.get(`/job-postings/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error("Job fetch failed");
      }
    };
    fetchJob();
  }, [jobId]);

  const [formData, setFormData] = useState({
    expectedSalary: '',
    availability: 'immediate',
    workPreference: 'office',
    coverLetter: ''
  });

  const t = {
    ar: {
      title: "تقديم طلب انضمام",
      salary: "الراتب المتوقع (شهرياً)",
      pref: "تفضيل العمل",
      office: "مكتبي", remote: "عن بعد", hybrid: "هجين (مكتبي + عن بعد)",
      avail: "تاريخ الالتحاق",
      immediate: "فوري", week2: "خلال أسبوعين", month1: "خلال شهر",
      letter: "رسالة تغطية (اختياري)",
      btn: "إرسال طلب التوظيف",
      success: "تم تقديم طلبك بنجاح! سيقوم فريق التوظيف بمراجعته.",
      error: "حدث خطأ، يرجى التأكد من ملء كافة الحقول"
    },
    en: {
      title: "Apply for Job",
      salary: "Expected Salary (Monthly)",
      pref: "Work Preference",
      office: "Office", remote: "Remote", hybrid: "Hybrid",
      avail: "Availability",
      immediate: "Immediate", week2: "Within 2 weeks", month1: "Within a month",
      letter: "Cover Letter (Optional)",
      btn: "Submit Application",
      success: "Application submitted successfully!",
      error: "Error, please check your inputs"
    }
  }[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/job-applications`, { ...formData, jobPostingId: jobId });
      alert(t.success);
      navigate('/job-postings');
    } catch (err) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-white">
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-black text-[#1A365D] mb-4">{t.title}</h2>
             {job && (
               <div className="inline-block px-6 py-2 bg-[#1A365D]/5 rounded-2xl text-[#1A365D] font-black">
                 {job.title} - {job.companyName || 'Careerak'}
               </div>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase mr-4">{t.salary}</label>
                <input
                  type="number"
                  className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase mr-4">{t.pref}</label>
                <select
                  className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner appearance-none"
                  value={formData.workPreference}
                  onChange={(e) => setFormData({...formData, workPreference: e.target.value})}
                >
                  <option value="office">{t.office}</option>
                  <option value="remote">{t.remote}</option>
                  <option value="hybrid">{t.hybrid}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase mr-4">{t.avail}</label>
              <select
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner appearance-none"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
              >
                <option value="immediate">{t.immediate}</option>
                <option value="2weeks">{t.week2}</option>
                <option value="1month">{t.month1}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase mr-4">{t.letter}</label>
              <textarea
                className="w-full p-6 bg-gray-50 rounded-[3rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner h-40"
                value={formData.coverLetter}
                onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
              />
            </div>

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
