import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useAuth();
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    const fetchCourses = async () => {
      try {
        const res = await api.get('/educational-courses');
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const t = {
    ar: {
      title: "أكاديمية كاريرك التعليمية",
      sub: "طور مهاراتك مع أفضل الدورات التدريبية المعتمدة",
      enroll: "تسجيل في الدورة",
      price: "السعر",
      free: "دورة مجانية",
      level: "المستوى",
      noCourses: "لا توجد دورات متاحة حالياً"
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-24 pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-[#304B60] mb-2 italic">{t.title}</h2>
          <p className="text-[#304B60]/40 font-bold">{t.sub}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#304B60]/30 border-t-[#304B60] rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-[#E3DAD1] rounded-[3rem] p-20 text-center shadow-xl border-2 border-[#304B60]/5">
             <span className="text-6xl mb-6 block opacity-20">📚</span>
             <p className="text-[#304B60] font-black text-xl">{t.noCourses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course._id} className="bg-[#304B60]/5 rounded-[3.5rem] shadow-xl border border-[#D48161]/10 overflow-hidden flex flex-col hover:scale-[1.02] transition-all group">
                <div className="h-48 bg-[#304B60] relative flex items-center justify-center">
                  <span className="text-5xl opacity-20 text-[#E3DAD1]">🎓</span>
                  <div className="absolute top-4 right-4 px-4 py-2 bg-[#E3DAD1]/10 backdrop-blur-md rounded-xl text-[#E3DAD1] text-[10px] font-black uppercase">
                    {course.category || 'General'}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-[#304B60] mb-4 h-14 overflow-hidden">{course.title}</h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs font-bold text-[#304B60]/40">
                      <span>{t.level}:</span>
                      <span className="text-[#304B60]">{course.skillLevel || 'Beginner'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#304B60]/40">
                      <span>{t.price}:</span>
                      <span className="text-[#D48161] font-black">{course.price === 0 ? t.free : `$${course.price}`}</span>
                    </div>
                  </div>

                  <button className="w-full bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all mt-auto">
                    {t.enroll}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
