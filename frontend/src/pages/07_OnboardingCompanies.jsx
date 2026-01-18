import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function OnboardingCompanies() {
  const navigate = useNavigate();
  const { language, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      title: "إعداد ملف المنشأة 🏢",
      sub: "أكمل بيانات شركتك للبدء في نشر الوظائف والدورات",
      bio: "وصف المنشأة",
      website: "الموقع الإلكتروني",
      address: "عنوان المقر الرئيسي",
      employees: "عدد الموظفين",
      declaration: "أقر بصحة بيانات المنشأة ومسؤوليتي القانونية عنها.",
      finish: "حفظ والبدء",
      placeholderBio: "اكتب نبذة عن نشاط الشركة وأهدافها...",
      placeholderWeb: "https://www.company.com",
      placeholderAddr: "المدينة، الشارع، المبنى",
      placeholderEmp: "مثال: 50-100"
    },
    en: {
      title: "Company Setup 🏢",
      sub: "Complete your profile to start posting jobs and courses",
      bio: "Company Description",
      website: "Website URL",
      address: "Headquarters Address",
      employees: "Number of Employees",
      declaration: "I declare that all company data is accurate.",
      finish: "Save & Start",
      placeholderBio: "Describe company activities and goals...",
      placeholderWeb: "https://www.company.com",
      placeholderAddr: "City, Street, Building",
      placeholderEmp: "Example: 50-100"
    },
    fr: {
      title: "Configuration de l'entreprise 🏢",
      sub: "Complétez votre profil pour commencer à publier des offres",
      bio: "Description de l'entreprise",
      website: "Site Web",
      address: "Adresse du siège social",
      employees: "Nombre d'employés",
      declaration: "Je déclare que toutes les données sont exactes.",
      finish: "Enregistrer et Commencer",
      placeholderBio: "Décrivez les activités et objectifs...",
      placeholderWeb: "https://www.entreprise.com",
      placeholderAddr: "Ville, Rue, Bâtiment",
      placeholderEmp: "Exemple: 50-100"
    }
  }[language || 'ar'];

  const [formData, setFormData] = useState({
    bio: '',
    website: '',
    address: '',
    employeeCount: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) return;
    setLoading(true);
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      navigate('/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 md:p-12 bg-[#E3DAD0] flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl p-8 md:p-16 border border-white transform transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#1A365D] mb-4">{t.title}</h2>
          <p className="text-[#1A365D]/40 font-bold italic">{t.sub}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-[#1A365D] px-4">{t.bio}</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder={t.placeholderBio}
              className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-[#1A365D] placeholder:text-gray-300 h-40 shadow-inner border-2 border-transparent focus:border-[#1A365D]/10"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-[#1A365D] px-4">{t.website}</label>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder={t.placeholderWeb}
                className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-[#1A365D] placeholder:text-gray-300 shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-[#1A365D] px-4">{t.employees}</label>
              <input
                type="text"
                value={formData.employeeCount}
                onChange={e => setFormData({...formData, employeeCount: e.target.value})}
                placeholder={t.placeholderEmp}
                className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-[#1A365D] placeholder:text-gray-300 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-[#1A365D] px-4">{t.address}</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder={t.placeholderAddr}
              className="w-full p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-[#1A365D] placeholder:text-gray-300 shadow-inner"
              required
            />
          </div>

          <div className="flex items-center gap-4 px-4 py-2">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={e => setIsAgreed(e.target.checked)}
              className="w-6 h-6 rounded-lg text-[#1A365D] focus:ring-[#1A365D]"
              required
            />
            <p className="text-xs font-bold text-gray-400 leading-relaxed">{t.declaration}</p>
          </div>

          <button
            type="submit"
            disabled={loading || !isAgreed}
            className={`w-full py-8 rounded-[3rem] font-black text-2xl shadow-2xl transition-all active:scale-95 ${isAgreed ? 'bg-[#1A365D] text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : t.finish}
          </button>
        </form>
      </div>
    </div>
  );
}
