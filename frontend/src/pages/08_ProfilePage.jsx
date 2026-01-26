import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Filesystem } from '@capacitor/filesystem'; // وعد: استبدال file-transfer الرسمي
import { Directory } from '@capacitor/filesystem';
import AlertModal from '../components/modals/AlertModal';

export default function ProfilePage() {
  const { user, language, updateUser, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvGenerating, setCvGenerating] = useState(false);
  const [cvLevel, setCvLevel] = useState('intermediate');
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthDate: '', email: '', phone: '', country: '', city: '',
    permanentAddress: '', temporaryAddress: '', socialStatus: '', hasChildren: false,
    militaryStatus: '',
    healthStatus: { hasChronic: false, chronic: '', hasSkin: false, skin: '', hasInfectious: false, infectious: '', notes: '' },
    educationList: [], experienceList: [], trainingList: [],
    languages: [], computerSkills: [], softwareSkills: [], otherSkills: [],
    bio: ''
  });

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      setFormData({
        ...user,
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        healthStatus: user.healthStatus || { hasChronic: false, chronic: '', hasSkin: false, skin: '', hasInfectious: false, infectious: '', notes: '' },
        educationList: user.educationList || [],
        experienceList: user.experienceList || [],
        trainingList: user.trainingList || [],
        languages: user.languages || [],
        computerSkills: user.computerSkills || [],
        softwareSkills: user.softwareSkills || [],
        otherSkills: user.otherSkills || []
      });
    }
  }, [user]);

  const t = {
    ar: {
      title: "الملف الشخصي", edit: "تعديل البيانات", save: "حفظ التغييرات", cancel: "إلغاء",
      personal: "البيانات الشخصية والاجتماعية", health: "الحالة الصحية", military: "حالة التجنيد",
      education: "المسيرة التعليمية", experience: "المسيرة المهنية", training: "المسيرة التدريبية",
      skills: "اللغات والمهارات", aiCv: "منشئ السيرة الذاتية الذكي (AI)", generateCv: "إنشاء سيرة ذاتية احترافية",
      cvLevels: { beginner: "مبتدئ", intermediate: "متوسط", professional: "احترافي" },
      logout: "تسجيل الخروج", add: "+ إضافة",
      socialStatuses: { single: 'عازب', married: 'متزوج', divorced: 'مطلق', widowed: 'أرمل' },
      militaryStatuses: { exempt: 'معفى', performed: 'مؤداة', paid: 'دافع بدل نقدي', postponed: 'مؤجلة', in_service: 'في الخدمة' },
      generating: "جاري الإنشاء...",
      cvSuccess: "تم تحميل السيرة الذاتية بنجاح",
      cvError: "حدث خطأ أثناء إنشاء أو تحميل السيرة الذاتية",
      ok: "حسناً"
    },
    en: {
      title: "Profile", edit: "Edit Data", save: "Save Changes", cancel: "Cancel",
      personal: "Personal and Social Data", health: "Health Status", military: "Military Status",
      education: "Educational Background", experience: "Professional Experience", training: "Training Background",
      skills: "Languages and Skills", aiCv: "Smart CV Generator (AI)", generateCv: "Generate Professional CV",
      cvLevels: { beginner: "Beginner", intermediate: "Intermediate", professional: "Professional" },
      logout: "Logout", add: "+ Add",
      socialStatuses: { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed' },
      militaryStatuses: { exempt: 'Exempt', performed: 'Performed', paid: 'Paid cash', postponed: 'Postponed', in_service: 'In Service' },
      generating: "Generating...",
      cvSuccess: "CV downloaded successfully",
      cvError: "Error occurred while creating or downloading CV",
      ok: "OK"
    },
    fr: {
      title: "Profil", edit: "Modifier les données", save: "Enregistrer les modifications", cancel: "Annuler",
      personal: "Données personnelles et sociales", health: "État de santé", military: "Statut militaire",
      education: "Parcours éducatif", experience: "Expérience professionnelle", training: "Parcours de formation",
      skills: "Langues et compétences", aiCv: "Générateur de CV intelligent (IA)", generateCv: "Générer un CV professionnel",
      cvLevels: { beginner: "Débutant", intermediate: "Intermédiaire", professional: "Professionnel" },
      logout: "Déconnexion", add: "+ Ajouter",
      socialStatuses: { single: 'Célibataire', married: 'Marié', divorced: 'Divorcé', widowed: 'Veuf' },
      militaryStatuses: { exempt: 'Exempté', performed: 'Accompli', paid: 'Payé en espèces', postponed: 'Reporté', in_service: 'En service' },
      generating: "Génération en cours...",
      cvSuccess: "CV téléchargé avec succès",
      cvError: "Erreur lors de la création ou du téléchargement du CV",
      ok: "OK"
    }
  }[language || 'ar'];

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      setIsEditing(false);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGenerateCv = async () => {
    setCvGenerating(true);
    try {
      const response = await userService.generateCv({ cvLevel });
      const fileUrl = response.data.url;
      const fileName = fileUrl.split('/').pop();

      await Filesystem.download(fileUrl, fileName, Directory.Documents);

      setAlertModal({ isOpen: true, message: t.cvSuccess });

    } catch (err) {
      console.error('Error generating or downloading CV:', err);
      setAlertModal({ isOpen: true, message: t.cvError });
    } finally {
      setCvGenerating(false);
    }
  };

  const inputCls = "w-full p-4 bg-[#E3DAD1] rounded-2xl border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-xs text-[#304B60] transition-all";
  const labelCls = "block text-[10px] font-black text-[#304B60]/60 mb-2 mr-2";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] pb-20 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 pt-24">
        <div className="bg-[#E3DAD1] rounded-[4rem] shadow-2xl overflow-hidden border-2 border-[#304B60]/5">
          <div className="h-48 bg-[#304B60] relative">
            <div className="absolute -bottom-20 right-12 flex items-end gap-6">
              <div className="w-40 h-40 rounded-full border-8 border-[#E3DAD1] shadow-2xl overflow-hidden bg-[#E3DAD1]">
                <img src={user?.profileImage || "/logo.jpg"} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="mb-6">
                <h2 className="text-3xl font-black text-[#E3DAD1]">{user?.firstName} {user?.lastName}</h2>
                <p className="text-[#D48161] font-bold uppercase tracking-widest text-xs">{user?.role}</p>
              </div>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="absolute top-8 left-8 px-6 py-3 bg-[#E3DAD1]/20 hover:bg-[#E3DAD1]/30 text-[#E3DAD1] rounded-2xl font-black text-xs backdrop-blur-md">
                {t.edit} ✏️
              </button>
            )}
          </div>

          <div className="pt-28 pb-12 px-8 md:px-16 space-y-12">
            <form className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-xl font-black text-[#304B60] border-r-4 border-[#D48161] pr-4">{t.personal}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>عنوان السكن الدائم</label>
                    {isEditing ? <input type="text" className={inputCls} value={formData.permanentAddress} onChange={e=>setFormData({...formData, permanentAddress:e.target.value})} /> : <p className="p-4 bg-[#304B60]/5 rounded-2xl font-bold text-[#304B60]">{formData.permanentAddress || '---'}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>الحالة الاجتماعية</label>
                    {isEditing ? (
                      <select className={inputCls} value={formData.socialStatus} onChange={e=>setFormData({...formData, socialStatus:e.target.value})}>
                        {Object.entries(t.socialStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : <p className="p-4 bg-[#304B60]/5 rounded-2xl font-bold text-[#304B60]">{t.socialStatuses[formData.socialStatus] || '---'}</p>}
                  </div>
                </div>
              </section>

              {isEditing && (
                <div className="flex gap-4">
                  <button type="button" onClick={handleSave} disabled={loading} className="flex-1 py-5 bg-[#304B60] text-[#D48161] rounded-[2rem] font-black shadow-xl disabled:opacity-50">
                    {loading ? 'جاري الحفظ...' : t.save}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-5 border-2 border-[#304B60] text-[#304B60] rounded-[2rem] font-black">{t.cancel}</button>
                </div>
              )}
            </form>

            <section className="p-10 bg-[#304B60] rounded-[4rem] text-[#E3DAD1] shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-right flex-1">
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3">✨ {t.aiCv}</h3>
                    <p className="text-[#E3DAD1]/70 font-bold text-sm">حول بياناتك إلى سيرة ذاتية احترافية بجودة PDF.</p>
                  </div>
                  <div className="bg-[#E3DAD1]/10 p-2 rounded-[2.5rem] flex flex-col gap-3 w-full max-w-xs">
                     <div className="flex gap-2 p-1 bg-black/20 rounded-2xl">
                        {Object.entries(t.cvLevels).map(([k,v]) => (
                          <button key={k} onClick={()=>setCvLevel(k)} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${cvLevel === k ? 'bg-[#E3DAD1] text-[#304B60]' : 'text-[#E3DAD1]/40'}`}>{v}</button>
                        ))}
                     </div>
                     <button onClick={handleGenerateCv} disabled={cvGenerating} className="w-full py-5 bg-[#E3DAD1] text-[#304B60] rounded-2xl font-black shadow-2xl active:scale-95">{cvGenerating ? t.generating : t.generateCv}</button>
                  </div>
               </div>
            </section>

            <div className="text-center pt-10">
              <button onClick={logout} className="px-10 py-5 bg-red-600 text-white rounded-[2rem] font-black text-xs shadow-lg shadow-red-200">
                {t.logout} 🚪
              </button>
            </div>
          </div>
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
