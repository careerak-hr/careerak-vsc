import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { user, language } = useAuth();
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
    },
    en: {
      title: "Careerak Academy",
      sub: "Develop your skills with the best certified training courses",
      enroll: "Enroll Now",
      price: "Price",
      free: "Free Course",
      level: "Level",
      noCourses: "No courses available at the moment"
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />
      
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-[#1A365D] mb-2">{t.title}</h2>
          <p className="text-[#1A365D]/40 font-bold">{t.sub}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#1A365D]/30 border-t-[#1A365D] rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-white">
             <span className="text-6xl mb-6 block">📚</span>
             <p className="text-[#1A365D] font-black text-xl">{t.noCourses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-[3.5rem] shadow-xl border border-white overflow-hidden flex flex-col hover:scale-[1.02] transition-all group">
                <div className="h-48 bg-[#1A365D] relative flex items-center justify-center">
                  <span className="text-5xl opacity-40">🎓</span>
                  <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase">
                    {course.category || 'General'}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-[#1A365D] mb-4 h-14 overflow-hidden">{course.title}</h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                      <span>{t.level}:</span>
                      <span className="text-[#1A365D]">{course.skillLevel || 'Beginner'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                      <span>{t.price}:</span>
                      <span className="text-green-600 font-black">{course.price === 0 ? t.free : `$${course.price}`}</span>
                    </div>
                  </div>

                  <button className="w-full bg-[#1A365D] text-white py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all mt-auto group-hover:shadow-2xl">
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
