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
      title: "Setup Company Profile 🏢",
      sub: "Complete your company details to start posting jobs and courses",
      bio: "Company Description",
      website: "Website",
      address: "Headquarters Address",
      employees: "Number of Employees",
      declaration: "I certify the accuracy of the company data and my legal responsibility for it.",
      finish: "Save and Start",
      placeholderBio: "Write a brief about the company's activities and goals...",
      placeholderWeb: "https://www.company.com",
      placeholderAddr: "City, Street, Building",
      placeholderEmp: "Example: 50-100"
    },
    fr: {
      title: "Configurer le profil de l'entreprise 🏢",
      sub: "Complétez les détails de votre entreprise pour commencer à publier des emplois et des cours",
      bio: "Description de l'entreprise",
      website: "Site web",
      address: "Adresse du siège social",
      employees: "Nombre d'employés",
      declaration: "Je certifie l'exactitude des données de l'entreprise et ma responsabilité légale à cet égard.",
      finish: "Enregistrer et commencer",
      placeholderBio: "Écrivez un aperçu des activités et objectifs de l'entreprise...",
      placeholderWeb: "https://www.company.com",
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
      navigate('/interface-companies');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-6 bg-[#E3DAD1] rounded-[2.5rem] outline-none font-black text-[#304B60] placeholder:text-gray-400 border-2 border-[#D48161]/20 focus:border-[#D48161] shadow-sm transition-all";
  const labelCls = "text-sm font-black text-[#304B60] px-4 mb-2 block";

  return (
    <div className={`min-h-screen p-6 md:p-12 bg-[#E3DAD1] flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <div className={`w-full max-w-2xl bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-8 md:p-16 border-2 border-[#304B60]/5 transform transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#304B60] mb-4 italic">{t.title}</h2>
          <p className="text-[#304B60]/40 font-bold">{t.sub}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className={labelCls}>{t.bio}</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder={t.placeholderBio}
              className={`${inputCls} h-40 resize-none`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelCls}>{t.website}</label>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder={t.placeholderWeb}
                className={inputCls}
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>{t.employees}</label>
              <input
                type="text"
                value={formData.employeeCount}
                onChange={e => setFormData({...formData, employeeCount: e.target.value})}
                placeholder={t.placeholderEmp}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>{t.address}</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder={t.placeholderAddr}
              className={inputCls}
              required
            />
          </div>

          <div className="flex items-center gap-4 px-4 py-2">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={e => setIsAgreed(e.target.checked)}
              className="w-6 h-6 rounded-lg accent-[#304B60]"
              required
            />
            <p className="text-xs font-bold text-[#304B60]/40 leading-relaxed">{t.declaration}</p>
          </div>

          <button
            type="submit"
            disabled={loading || !isAgreed}
            className={`w-full py-8 rounded-[3rem] font-black text-2xl shadow-2xl transition-all active:scale-95 ${isAgreed ? 'bg-[#304B60] text-[#D48161]' : 'bg-[#304B60]/10 text-[#304B60]/30'}`}
          >
            {loading ? <div className="w-8 h-8 border-4 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin mx-auto"></div> : t.finish}
          </button>
        </form>
      </div>
    </div>
  );
}
