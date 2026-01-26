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
  const { language } = useAuth();
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
      noJobs: "لا توجد وظائف متاحة حالياً"
    },
    en: {
      title: "Available Job Opportunities",
      sub: "Discover the best jobs that match your skills",
      apply: "View Details / Apply",
      noJobs: "No jobs available currently"
    },
    fr: {
      title: "Opportunités d'emploi disponibles",
      sub: "Découvrez les meilleurs emplois qui correspondent à vos compétences",
      apply: "Voir les détails / Postuler",
      noJobs: "Aucun emploi disponible actuellement"
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-24 pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-[#304B60] mb-2 italic">{t.title}</h2>
          <p className="text-[#304B60]/40 font-bold">{t.sub}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#304B60]/30 border-t-[#304B60] rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#E3DAD1] rounded-[3rem] p-20 text-center shadow-xl border-2 border-[#304B60]/5">
             <span className="text-6xl mb-6 block opacity-20">📂</span>
             <p className="text-[#304B60] font-black text-xl">{t.noJobs}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map(job => (
              <div key={job._id} className="bg-[#304B60]/5 p-8 rounded-[3.5rem] shadow-xl border border-[#D48161]/10 hover:scale-[1.02] transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-[#304B60] flex items-center justify-center text-2xl shadow-inner`}>
                    🏢
                  </div>
                  <span className="px-4 py-2 bg-[#D48161]/10 text-[#D48161] rounded-xl text-[10px] font-black uppercase">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#304B60] mb-2">{job.title}</h3>
                <p className="text-[#304B60]/40 font-bold mb-6">{job.companyName || 'Careerak Partner'}</p>

                <div className="flex gap-4 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#304B60]/60">
                    <span>📍</span> {job.location || 'Remote'}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/apply/${job._id}`)}
                  className="w-full bg-[#304B60] text-[#D48161] py-5 rounded-3xl font-black text-lg shadow-lg active:scale-95 transition-all"
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
