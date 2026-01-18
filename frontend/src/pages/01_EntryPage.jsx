import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverBestServer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { App } from '@capacitor/app';

const entryTranslations = {
  ar: { slogan: "مستقبل الموارد البشرية" },
  en: { slogan: "The Future of HR" },
  fr: { slogan: "L'avenir des RH" }
};

export default function EntryPage() {
  const [phase, setPhase] = useState(0); // 0 = سكون، 1 = ظهور، 2 = تفاعل، 3 = خروج
  const navigate = useNavigate();
  const { audioEnabled, language } = useAuth();
  const t = entryTranslations[language] || entryTranslations.ar;

  const audioRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. اكتشاف السيرفر في الخلفية
    const initServer = async () => {
      try {
        await discoverBestServer();
      } catch (error) {
        console.log("Server initializing...");
      }
    };
    initServer();

    const SYSTEM_DELAY = 1000;

    // 2. سلسلة المؤقتات (تعمل مرة واحدة فقط عند التحميل)
    const timers = [
      setTimeout(() => {
        if (isMounted.current) {
          setPhase(1);
          if (audioEnabled && !audioRef.current) {
            audioRef.current = new Audio('/intro.mp3');
            audioRef.current.volume = 0.6;
            audioRef.current.play().catch(() => {});
          }
        }
      }, SYSTEM_DELAY),

      setTimeout(() => {
        if (isMounted.current) setPhase(2);
      }, SYSTEM_DELAY + 1500),

      setTimeout(() => {
        if (isMounted.current) setPhase(3);
      }, SYSTEM_DELAY + 7000),

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (isMounted.current) navigate('/login', { replace: true });
      }, SYSTEM_DELAY + 9000)
    ];

    // إدارة حالة التطبيق (إيقاف/تشغيل الصوت عند الخروج من التطبيق)
    const handleAppState = (state) => {
      if (audioRef.current) {
        if (state.isActive && audioEnabled) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    };

    const listener = App.addListener('appStateChange', handleAppState);

    return () => {
      isMounted.current = false;
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      listener.then(l => l.remove());
    };
    // تم حذف [phase] من هنا لحل مشكلة التكرار والجمود
  }, [navigate, audioEnabled]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#E3DAD0] select-none">
      <div className={`absolute inset-0 bg-gradient-to-b from-white/20 to-transparent transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative flex flex-col items-center justify-center w-full h-full max-h-screen">
        <div className="relative flex items-center justify-center">
          <div className={`absolute w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] bg-[#1A365D] opacity-[0.04] rounded-full transition-transform duration-[7000ms] ease-out ${phase >= 2 ? 'scale-150' : 'scale-0'}`}></div>

          <div className={`relative transition-all duration-1000 ease-out transform ${
            phase === 0 ? 'scale-75 opacity-0' :
            phase === 1 ? 'scale-110 opacity-100' :
            phase === 2 ? 'scale-100 opacity-100' :
            'scale-90 opacity-0'
          }`}>
            <div className="relative p-2 md:p-4">
              <div className="absolute inset-0 border-2 border-[#1A365D]/10 rounded-full animate-spin-slow"></div>
              <img src="/logo.jpg" alt="Logo" className="relative h-32 w-32 md:h-48 md:w-48 rounded-full border-[4px] border-[#1A365D] shadow-2xl object-cover" />
            </div>
          </div>
        </div>

        <div className={`mt-6 md:mt-12 text-center transition-all duration-1000 delay-300 transform ${phase >= 1 && phase < 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-black text-[#1A365D] tracking-tight mb-4 drop-shadow-sm italic" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1.5px] w-10 md:w-16 bg-[#1A365D]/20"></div>
            <p className="text-[#1A365D]/80 font-black text-[13px] md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em]">{t.slogan}</p>
            <div className="h-[1.5px] w-10 md:w-16 bg-[#1A365D]/20"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 md:bottom-20 w-48 md:w-64 h-[2px] md:h-[3px] bg-[#1A365D]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1A365D] transition-all ease-linear"
          style={{
            width: phase >= 1 ? '100%' : '0%',
            transitionDuration: phase >= 1 ? '8500ms' : '0ms'
          }}
        ></div>
      </div>
    </div>
  );
}
