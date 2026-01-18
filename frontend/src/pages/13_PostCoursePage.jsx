import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function PostCoursePage() {
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    if (user && user.role !== 'HR' && user.role !== 'Admin') {
      navigate('/courses');
    }
  }, [user, navigate]);

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
      success: "تم نشر الدورة بنجاح في الأكاديمية!"
    },
    en: {
      title: "Add New Educational Course",
      courseTitle: "Course Title",
      desc: "Course Description & Learning Outcomes",
      instructor: "Instructor Name",
      category: "Course Category",
      level: "Course Level",
      price: "Course Price (0 for Free)",
      btn: "Publish Course Now",
      success: "Course published successfully in the Academy!"
    }
  }[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/educational-courses', formData);
      alert(t.success);
      navigate('/courses');
    } catch (err) {
      alert(isRTL ? 'خطأ في نشر الدورة' : 'Error publishing course');
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
                type="text" placeholder={t.courseTitle}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
              />
              <input
                type="text" placeholder={t.instructor}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text" placeholder={t.category}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
              <select
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner appearance-none"
                value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input
                type="number" placeholder={t.price}
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner"
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <textarea
              placeholder={t.desc}
              className="w-full p-6 bg-gray-50 rounded-[3rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black shadow-inner h-48"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
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
