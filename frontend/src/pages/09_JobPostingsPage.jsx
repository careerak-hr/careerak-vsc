import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import ReportModal from '../components/modals/ReportModal';

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
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
      noJobs: "لا توجد وظائف متاحة حالياً",
      report_job: "الإبلاغ عن وظيفة"
    },
    en: {
      title: "Available Job Opportunities",
      sub: "Discover the best jobs that match your skills",
      apply: "View Details / Apply",
      noJobs: "No jobs available currently",
      report_job: "Report Job"
    },
    fr: {
      title: "Opportunités d'emploi disponibles",
      sub: "Découvrez les meilleurs emplois qui correspondent à vos compétences",
      apply: "Voir les détails / Postuler",
      noJobs: "Aucun emploi disponible actuellement",
      report_job: "Signaler un emploi"
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
              <div key={job._id} className="bg-[#304B60]/5 p-8 rounded-[3.5rem] shadow-xl border border-[#D48161]/10 hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-[#304B60] flex items-center justify-center text-2xl shadow-inner`}>
                    🏢
                  </div>
                  <span className="px-4 py-2 bg-[#D48161]/10 text-[#D48161] rounded-xl text-[10px] font-black uppercase">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#304B60]">{job.title}</h3>
                      <p className="text-[#304B60]/40 font-bold mb-6">{job.companyName || 'Careerak Partner'}</p>

                      <div className="flex gap-4 mb-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#304B60]/60">
                          <span>📍</span> {job.location || 'Remote'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReportModalData({ type: 'job_post', id: job.id, name: job.title })}
                      className="text-red-600 hover:text-red-800 p-2"
                      title={t('report_job')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </button>
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

      <ReportModal
        isOpen={!!reportModalData}
        onClose={() => setReportModalData(null)}
        targetType={reportModalData?.type}
        targetId={reportModalData?.id}
        targetName={reportModalData?.name}
      />
    </div>
  );
}
