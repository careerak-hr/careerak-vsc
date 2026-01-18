import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

/**
 * واجهة المساعد الشامل (Ultimate Assist)
 * مخصصة للمستخدمين الذين يجمعون بين "الأمية" و "فقدان البصر"
 * تعتمد كلياً على الصوت (نطقاً واستماعاً) مع واجهة لمس كاملة الشاشة
 */
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
    },
    en: {
      welcome: "Welcome to Careerak Ultimate Assist. This mode is active because you are registered as blind and illiterate. I will now guide you using voice. Tap anywhere on the screen after the signal to start speaking.",
      steps: [
        { key: 'name', prompt: "First, please say your full name after the signal." },
        { key: 'skills', prompt: "Great. Now tell me, what skills or crafts are you good at?" },
        { key: 'bio', prompt: "Finally, is there anything else you'd like to tell me about yourself or the jobs you're looking for?" },
        { key: 'finish', prompt: "Excellent. We've finished setting up your profile. I will now take you to your voice dashboard." }
      ],
      listening: "I am listening now, please speak...",
      error: "Sorry, I couldn't hear you clearly. Please tap the screen and try again.",
      tapToTalk: "Tap screen to talk"
    }
  }[language || 'ar'];

  useEffect(() => {
    setIsVisible(true);

    const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        speak(t.error);
      };
    }

    speak(t.welcome);
    setTimeout(() => speak(t.steps[0].prompt), 9000);
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const processVoiceInput = (text) => {
    setIsListening(false);
    const currentKey = t.steps[step].key;
    const newData = { ...userData, [currentKey]: text };
    setUserData(newData);

    const nextStep = step + 1;
    if (nextStep < t.steps.length) {
      setStep(nextStep);
      speak(t.steps[nextStep].prompt);
    } else {
      finalize(newData);
    }
  };

  const handleScreenTouch = () => {
    if (isListening) return;
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      setIsListening(true);
      setTimeout(() => processVoiceInput("بيانات تجريبية للمساعد الشامل"), 3000);
    }
  };

  const finalize = async (finalData) => {
    try {
      const res = await userService.updateProfile({
        bio: `[Ultimate Assist Mode] Skills: ${finalData.skills}. Additional: ${finalData.bio}`,
        firstName: finalData.name.split(' ')[0],
        lastName: finalData.name.split(' ').slice(1).join(' '),
        isSpecialNeeds: true,
        specialNeedType: 'بصري',
        education: 'أمي / لا أقرأ ولا أكتب'
      });
      updateUser(res.data.user);
      speak(t.steps[3].prompt);
      setTimeout(() => navigate('/profile'), 4000);
    } catch (e) {
      navigate('/profile');
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-[#1A365D] flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
      onClick={handleScreenTouch}
    >
      <div className="relative">
        <div className={`w-80 h-80 rounded-full border-[15px] border-white/5 flex items-center justify-center transition-all duration-700 ${isListening ? 'scale-125 border-white shadow-[0_0_150px_rgba(255,255,255,0.4)]' : 'scale-100'}`}>
          <div className={`text-[10rem] transition-all duration-500 ${isListening ? 'opacity-100 rotate-12' : 'opacity-20 rotate-0'}`}>
            🎙️
          </div>
        </div>
        {isListening && <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>}
      </div>

      <div className="mt-20 text-center px-10">
        <h1 className="text-white text-3xl font-black opacity-40 uppercase tracking-[0.5em] mb-4">Ultimate Assist</h1>
        <p className="text-white text-xl font-bold animate-pulse">
          {isListening ? t.listening : t.tapToTalk}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
        className="absolute top-10 right-10 w-12 h-12 bg-white/10 rounded-full text-white/20 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}
