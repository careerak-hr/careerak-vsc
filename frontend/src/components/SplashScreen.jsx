import React, { useEffect, useState } from 'react';
import { discoverBestServer } from '../services/api';

export const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 1. تشغيل ملف intro.mp3
    const introPath = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/intro.mp3` : '/intro.mp3';
    const audio = new Audio(introPath);
    audio.volume = 0.8;
    
    const playIntro = () => {
      audio.play().catch(e => console.log("Intro audio waiting for interaction"));
    };

    playIntro();
    window.addEventListener('click', playIntro, { once: true });

    // 2. البدء في اكتشاف السيرفر فوراً في الخلفية
    const initServer = async () => {
      try {
        await discoverBestServer();
      } catch (error) {
        console.error("Server discovery failed", error);
      }
    };

    initServer();

    // 3. إدارة مراحل الأنيميشن
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 7500),
      setTimeout(() => {
        audio.pause();
        onFinish(); // الانتقال للصفحة التالية بعد انتهاء وقت السبلاش
      }, 9000)
    ];

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('click', playIntro);
      audio.pause();
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#E3DAD0] select-none">
      <div className={`absolute inset-0 bg-gradient-to-b from-white/20 to-transparent transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div className="relative flex flex-col items-center justify-center w-full h-full max-h-screen">
        <div className="relative flex items-center justify-center">
          <div className={`absolute w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] bg-[#1A365D] opacity-[0.04] rounded-full transition-transform duration-[8000ms] ease-out ${phase >= 2 ? 'scale-150' : 'scale-0'}`}></div>
          <div className={`relative transition-all duration-1500 ease-out transform ${
            phase === 0 ? 'scale-75 opacity-0' : 
            phase === 1 ? 'scale-110 opacity-100' : 
            phase === 2 ? 'scale-100 opacity-100' : 
            'scale-90 opacity-0'
          }`}>
            <div className="relative p-2 md:p-4">
              <div className="absolute inset-0 border-2 border-[#1A365D]/10 rounded-full animate-spin-slow"></div>
              <img src="./logo.jpg" alt="Careerak logo - The future of HR and career development" className="relative h-32 w-32 md:h-48 md:w-48 rounded-full border-[4px] border-white shadow-2xl object-cover" />
            </div>
          </div>
        </div>

        <div className={`mt-6 md:mt-12 text-center transition-all duration-1000 delay-300 transform ${phase >= 1 && phase < 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl font-black text-[#1A365D] tracking-tight mb-2 drop-shadow-sm italic" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 md:w-12 bg-[#1A365D]/30"></div>
            <p className="text-[#1A365D]/70 font-bold text-[8px] md:text-xs uppercase tracking-[0.4em]">The Future of HR</p>
            <div className="h-[1px] w-8 md:w-12 bg-[#1A365D]/30"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 md:bottom-20 w-48 md:w-64 h-[2px] md:h-[3px] bg-[#1A365D]/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#1A365D] transition-all ease-linear" style={{ width: phase >= 1 ? '100%' : '0%', transitionDuration: '8500ms' }}></div>
      </div>
    </div>
  );
};
