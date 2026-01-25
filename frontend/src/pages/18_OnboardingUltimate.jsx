import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

export default function OnboardingUltimate() {
  const navigate = useNavigate();
  const { language, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState({ name: '', skills: '', bio: '' });

  const recognitionRef = useRef(null);

  const t = {
    ar: {
      welcome: "مرحباً بك في نظام نبراس للمساعدة الشاملة من كاريرك. لقد تم تفعيل هذا النظام لأنك مسجل ككفيف ولا تجيد القراءة. سأتحدث معك الآن وأقوم بجمع بياناتك صوتياً. المس الشاشة في أي مكان عندما تسمع الإشارة لتبدأ الحديث.",
      steps: [
        { key: 'name', prompt: "أولاً، من فضلك قل اسمك بالكامل بعد سماع الإشارة." },
        { key: 'skills', prompt: "جميل. الآن أخبرني، ما هي المهارات أو الحرف التي تجيدها؟" },
        { key: 'bio', prompt: "أخيراً، هل تود إخباري بأي شيء آخر عن نفسك أو عن الوظائف التي تبحث عنها؟" },
        { key: 'finish', prompt: "رائع جداً. لقد انتهينا من إعداد ملفك الشخصي بالكامل. سأقوم الآن بنقلك إلى لوحة التحكم الصوتية الخاصة بك." }
      ],
      listening: "أنا أسمعك الآن، تفضل بالتحدث...",
      error: "عذراً، لم أستطع سماعك بوضوح. من فضلك المس الشاشة وحاول مرة أخرى.",
      tapToTalk: "المس الشاشة للتحدث"
    }
  }[language || 'ar'];

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const finalize = useCallback(async (finalData) => {
    try {
      const res = await userService.updateProfile({ bio: `[Ultimate] ${finalData.skills}. ${finalData.bio}`, isSpecialNeeds: true, specialNeedType: 'بصري' });
      updateUser(res.data.user);
      speak(t.steps[3].prompt);
      setTimeout(() => navigate('/profile'), 4000);
    } catch (e) { navigate('/profile'); }
  }, [navigate, speak, t.steps, updateUser]);

  const processVoiceInput = useCallback((text) => {
    setIsListening(false);
    const newData = { ...userData, [t.steps[step].key]: text };
    setUserData(newData);
    const nextStep = step + 1;
    if (nextStep < t.steps.length) { setStep(nextStep); speak(t.steps[nextStep].prompt); }
    else { finalize(newData); }
  }, [finalize, speak, step, t.steps, userData]);

  useEffect(() => {
    setIsVisible(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognitionRef.current.onresult = (event) => { processVoiceInput(event.results[0][0].transcript); };
      recognitionRef.current.onerror = () => { setIsListening(false); speak(t.error); };
    }
    speak(t.welcome);
    setTimeout(() => speak(t.steps[0].prompt), 9000);
  }, [language, processVoiceInput, speak, t.error, t.steps, t.welcome]);

  const handleScreenTouch = () => {
    if (isListening) return;
    if (recognitionRef.current) { setIsListening(true); recognitionRef.current.start(); }
    else { setIsListening(true); setTimeout(() => processVoiceInput("بيانات تجريبية"), 3000); }
  };

  return (
    <div className={`fixed inset-0 bg-[#304B60] flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} cursor-pointer`} onClick={handleScreenTouch}>
      <div className="relative">
        <div className={`w-80 h-80 rounded-full border-[15px] border-[#D48161]/10 flex items-center justify-center transition-all duration-700 ${isListening ? 'scale-125 border-[#D48161] shadow-[0_0_150px_rgba(212,129,97,0.4)]' : 'scale-100'}`}>
          <div className={`text-[10rem] transition-all duration-500 ${isListening ? 'opacity-100 rotate-12' : 'opacity-20 rotate-0'}`}>🎙️</div>
        </div>
        {isListening && <div className="absolute inset-0 bg-[#D48161]/20 rounded-full animate-ping"></div>}
      </div>
      <div className="mt-20 text-center px-10">
        <h1 className="text-[#E3DAD1] text-3xl font-black opacity-20 uppercase tracking-[0.5em] mb-4">Ultimate Assist</h1>
        <p className="text-[#E3DAD1] text-xl font-bold animate-pulse">{isListening ? t.listening : t.tapToTalk}</p>
      </div>
    </div>
  );
}
