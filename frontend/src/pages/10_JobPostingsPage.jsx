import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    const fetchJobs = async () => {
      try {
        const res = await api.get('/job-postings');
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const t = {
    ar: {
      title: "الفرص المهنية المتاحة",
      sub: "اكتشف أفضل الوظائف التي تناسب مهاراتك",
      apply: "عرض التفاصيل / تقديم",
      location: "الموقع",
      type: "نوع العمل",
      noJobs: "لا توجد وظائف متاحة حالياً"
    },
    en: {
      title: "Available Job Opportunities",
      sub: "Discover the best jobs that match your skills",
      apply: "View Details / Apply",
      location: "Location",
      type: "Job Type",
      noJobs: "No jobs available at the moment"
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />
      
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-[#1A365D] mb-2">{t.title}</h2>
          <p className="text-[#1A365D]/40 font-bold">{t.sub}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#1A365D]/30 border-t-[#1A365D] rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-white">
             <span className="text-6xl mb-6 block">📂</span>
             <p className="text-[#1A365D] font-black text-xl">{t.noJobs}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map(job => (
              <div key={job._id} className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-white hover:scale-[1.02] transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-[#1A365D]/5 flex items-center justify-center text-2xl shadow-inner`}>
                    🏢
                  </div>
                  <span className="px-4 py-2 bg-[#E3DAD0]/50 text-[#1A365D] rounded-xl text-[10px] font-black uppercase">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#1A365D] mb-2">{job.title}</h3>
                <p className="text-gray-400 font-bold mb-6">{job.companyName || 'Careerak Partner'}</p>

                <div className="flex gap-4 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A365D]/60">
                    <span>📍</span> {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A365D]/60">
                    <span>💰</span> {job.salary?.min ? `${job.salary.min}$ - ${job.salary.max}$` : 'Competitive'}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/apply/${job._id}`)}
                  className="w-full bg-[#1A365D] text-white py-5 rounded-3xl font-black text-lg shadow-lg active:scale-95 transition-all group-hover:shadow-2xl"
                >
                  {t.apply}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
