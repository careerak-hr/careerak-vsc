import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function PostCoursePage() {
  const navigate = useNavigate();
  const { user, language, startBgMusic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    
    // تشغيل الموسيقى الخلفية
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    if (user && user.role !== 'HR' && user.role !== 'Admin') {
      navigate('/courses');
    }
  }, [user, navigate, startBgMusic]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    skillLevel: 'Beginner',
    price: 0
  });

  const t = {
    ar: {
      title: "إضافة دورة تعليمية جديدة",
      courseTitle: "عنوان الدورة",
      desc: "وصف الدورة والمخرجات التعليمية",
      instructor: "اسم المحاضر / المدرب",
      category: "تصنيف الدورة",
      level: "مستوى الدورة",
      price: "سعر الدورة (0 للمجانية)",
      btn: "نشر الدورة التعليمية",
      success: "تم نشر الدورة بنجاح في الأكاديمية!",
      loading: "..."
    },
    en: {
      title: "Add New Educational Course",
      courseTitle: "Course Title",
      desc: "Course Description and Learning Outcomes",
      instructor: "Instructor / Trainer Name",
      category: "Course Category",
      level: "Course Level",
      price: "Course Price (0 for free)",
      btn: "Publish Educational Course",
      success: "Course published successfully in the Academy!",
      loading: "Publishing..."
    },
    fr: {
      title: "Ajouter un nouveau cours éducatif",
      courseTitle: "Titre du cours",
      desc: "Description du cours et résultats d'apprentissage",
      instructor: "Nom de l'instructeur / formateur",
      category: "Catégorie du cours",
      level: "Niveau du cours",
      price: "Prix du cours (0 pour gratuit)",
      btn: "Publier le cours éducatif",
      success: "Cours publié avec succès dans l'Académie !",
      loading: "Publication..."
    }
  }[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/educational-courses', formData);
      navigate('/courses');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-5 bg-[#E3DAD1] rounded-[2rem] border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-[#304B60] placeholder:text-gray-400 shadow-sm transition-all";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-24 pb-32">
        <div className="bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-10 md:p-16 border-2 border-[#304B60]/5">
          <h2 className={`text-3xl font-black text-[#304B60] mb-10 border-[#D48161] ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text" placeholder={t.courseTitle}
                className={inputCls}
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
              />
              <input
                type="text" placeholder={t.instructor}
                className={inputCls}
                value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text" placeholder={t.category}
                className={inputCls}
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
              <select
                className={inputCls}
                value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input
                type="number" placeholder={t.price}
                className={inputCls}
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <textarea
              placeholder={t.desc}
              className={`${inputCls} h-48 resize-none`}
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#304B60] text-[#D48161] py-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-8"
            >
              {loading ? t.loading : t.btn}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
