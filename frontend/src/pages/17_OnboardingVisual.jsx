import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

export default function OnboardingVisual() {
  const navigate = useNavigate();
  const { language, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userInput, setUserInput] = useState({ name: '', profession: '', experience: '' });

  const recognitionRef = useRef(null);

  const t = {
    ar: {
      welcome: "مرحباً بك في واجهة كاريرك الصوتية. سنقوم الآن بإعداد ملفك الشخصي عن طريق الصوت. اضغط في أي مكان على الشاشة للتحدث عند سماع الإشارة.",
      steps: [
        { key: 'name', prompt: "من فضلك، قل اسمك بالكامل بعد سماع الإشارة." },
        { key: 'profession', prompt: "ما هو تخصصك أو مهنتك الحالية؟" },
        { key: 'experience', prompt: "أخبرنا عن خبراتك السابقة باختصار." },
        { key: 'finish', prompt: "تم حفظ بياناتك بنجاح. سننتقل الآن إلى صفحتك الشخصية." }
      ],
      listening: "جاري الاستماع... تفضل بالتحدث",
      tapToTalk: "المس الشاشة للتحدث",
      error: "عذراً، لم أسمعك جيداً. المس الشاشة وحاول مرة أخرى."
    },
    en: {
      welcome: "Welcome to Careerak Voice Interface. We will now set up your profile using voice. Tap anywhere on the screen to talk after the signal.",
      steps: [
        { key: 'name', prompt: "Please say your full name after the signal." },
        { key: 'profession', prompt: "What is your current profession or specialty?" },
        { key: 'experience', prompt: "Tell us briefly about your past experiences." },
        { key: 'finish', prompt: "Data saved successfully. Moving to your profile." }
      ],
      listening: "Listening... Please speak",
      tapToTalk: "Tap screen to talk",
      error: "Sorry, I didn't catch that. Tap and try again."
    }
  }[language || 'ar'];

  useEffect(() => {
    setIsVisible(true);

    // إعداد التعرف على الكلام (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        speak(t.error);
      };
    }

    speak(t.welcome);
    setTimeout(() => speak(t.steps[0].prompt), 6000);
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const processInput = (text) => {
    setIsListening(false);
    const currentKey = t.steps[step].key;
    const updatedInput = { ...userInput, [currentKey]: text };
    setUserInput(updatedInput);

    const nextStep = step + 1;
    if (nextStep < t.steps.length) {
      setStep(nextStep);
      speak(t.steps[nextStep].prompt);
    } else {
      finish(updatedInput);
    }
  };

  const handleScreenTap = () => {
    if (isListening) return;

    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      // Fallback محاكاة إذا لم يدعم المتصفح
      setIsListening(true);
      setTimeout(() => {
        processInput("بيانات تجريبية صوتية");
      }, 3000);
    }
  };

  const finish = async (data) => {
    try {
      const res = await userService.updateProfile({
        bio: `${data.profession}. ${data.experience}`,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' '),
        isVisualMode: true
      });
      updateUser(res.data.user);
      speak(t.steps[3].prompt);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (e) {
      navigate('/profile');
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#1A365D] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
      onClick={handleScreenTap}
      aria-label={isListening ? t.listening : t.tapToTalk}
    >
      <div className="text-center space-y-16">
        {/* عنصر بصري للمرافقين أو ضعاف البصر */}
        <div className={`w-72 h-72 rounded-full border-[12px] border-white/10 flex items-center justify-center mx-auto transition-all duration-700 ${isListening ? 'scale-125 border-white bg-white/20 shadow-[0_0_100px_rgba(255,255,255,0.3)]' : 'scale-100 shadow-2xl'}`}>
          <div className={`text-9xl transition-transform duration-500 ${isListening ? 'scale-110' : 'scale-90 opacity-40'}`}>
            🎙️
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-white text-5xl font-black tracking-tight animate-pulse">
            {isListening ? t.listening : t.tapToTalk}
          </h2>

          <div className="flex justify-center gap-6">
            {t.steps.map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all duration-500 ${i === step ? 'bg-white scale-150 shadow-[0_0_20px_white]' : 'bg-white/20'}`}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-white/20 font-black text-xl tracking-[0.5em] uppercase">
          Careerak Voice Assist
        </div>
      </div>

      {/* تعليمات مخفية لقارئ الشاشة الأساسي */}
      <div className="sr-only" role="status" aria-live="polite">
        {isListening ? t.listening : t.tapToTalk}
      </div>
    </div>
  );
}
