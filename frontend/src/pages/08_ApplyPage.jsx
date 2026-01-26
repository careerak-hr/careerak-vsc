import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import AlertModal from '../components/modals/AlertModal';
import applyPageTranslations from '../data/applyPage.json';

export default function ApplyPage() {
  const { id } = useParams();
  const { language } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const fetchJob = async () => {
      try {
        const res = await api.get(`/job-postings/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/job-applications', { jobPostingId: id });
      setSuccess(true);
    } catch (err) {
      setAlertModal({ isOpen: true, message: t.alreadyApplied });
    } finally {
      setApplying(false);
    }
  };

  const t = applyPageTranslations[language] || applyPageTranslations.ar;

  if (loading) return <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#304B60] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-24 pb-32">
        <div className="bg-[#E3DAD1] rounded-[3rem] shadow-2xl p-8 md:p-12 border-2 border-[#304B60]/5">
          <div className="flex items-center gap-6 mb-10">
             <div className="w-20 h-20 bg-[#304B60] rounded-3xl flex items-center justify-center text-4xl shadow-inner">🏢</div>
             <div>
                <h2 className="text-3xl font-black text-[#304B60]">{job?.title}</h2>
                <p className="text-[#304B60]/50 font-bold">{job?.companyName}</p>
             </div>
          </div>

          <div className="space-y-8 text-[#304B60]">
            <section>
              <h3 className="text-xl font-black mb-4 border-r-4 border-[#D48161] pr-3">{t.description}</h3>
              <p className="font-bold leading-relaxed bg-[#304B60]/5 p-6 rounded-3xl border border-[#D48161]/10">{job?.description}</p>
            </section>

            <section>
              <h3 className="text-xl font-black mb-4 border-r-4 border-[#D48161] pr-3">{t.requirements}</h3>
              <p className="font-bold leading-relaxed bg-[#304B60]/5 p-6 rounded-3xl border border-[#D48161]/10">{job?.requirements}</p>
            </section>
          </div>

          {success ? (
            <div className="mt-12 p-8 bg-green-50 text-green-700 rounded-3xl font-black text-center border-2 border-green-200 animate-bounce">
              {t.success}
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full mt-12 py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all text-xl"
            >
              {applying ? "جاري التقديم..." : t.apply}
            </button>
          )}
        </div>
      </main>
      <Footer />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        language={language}
        t={t}
      />
    </div>
  );
}
