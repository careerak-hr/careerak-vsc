import React, { useState, useEffect, useRef, useCallback } from 'react';
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
      listening: "جاري الاستماع...",
      tapToTalk: "المس الشاشة للتحدث",
      error: "عذراً، لم أسمعك جيداً. المس الشاشة وحاول مرة أخرى."
    },
    en: {
      welcome: "Welcome to Careerak's voice interface. We will now set up your profile via voice. Tap anywhere on the screen to speak when you hear the signal.",
      steps: [
        { key: 'name', prompt: "Please say your full name after hearing the signal." },
        { key: 'profession', prompt: "What is your specialty or current profession?" },
        { key: 'experience', prompt: "Tell us about your previous experiences briefly." },
        { key: 'finish', prompt: "Your data has been saved successfully. We will now go to your personal page." }
      ],
      listening: "Listening...",
      tapToTalk: "Tap the screen to speak",
      error: "Sorry, I didn't hear you well. Tap the screen and try again."
    },
    fr: {
      welcome: "Bienvenue dans l'interface vocale de Careerak. Nous allons maintenant configurer votre profil via la voix. Appuyez n'importe où sur l'écran pour parler lorsque vous entendez le signal.",
      steps: [
        { key: 'name', prompt: "Veuillez dire votre nom complet après avoir entendu le signal." },
        { key: 'profession', prompt: "Quelle est votre spécialité ou profession actuelle ?" },
        { key: 'experience', prompt: "Parlez-nous brièvement de vos expériences précédentes." },
        { key: 'finish', prompt: "Vos données ont été enregistrées avec succès. Nous allons maintenant accéder à votre page personnelle." }
      ],
      listening: "Écoute en cours...",
      tapToTalk: "Appuyez sur l'écran pour parler",
      error: "Désolé, je ne vous ai pas bien entendu. Appuyez sur l'écran et essayez à nouveau."
    }
  }[language || 'ar'];

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const finish = useCallback(async (data) => {
    try {
      const res = await userService.updateProfile({ bio: `${data.profession}. ${data.experience}`, isVisualMode: true });
      updateUser(res.data.user);
      speak(t.steps[3].prompt);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (e) { navigate('/profile'); }
  }, [navigate, speak, t.steps, updateUser]);

  const processInput = useCallback((text) => {
    setIsListening(false);
    const updatedInput = { ...userInput, [t.steps[step].key]: text };
    setUserInput(updatedInput);
    const nextStep = step + 1;
    if (nextStep < t.steps.length) {
      setStep(nextStep);
      speak(t.steps[nextStep].prompt);
    } else {
      finish(updatedInput);
    }
  }, [finish, speak, step, t.steps, userInput]);

  useEffect(() => {
    setIsVisible(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognitionRef.current.onresult = (event) => { processInput(event.results[0][0].transcript); };
      recognitionRef.current.onerror = () => { setIsListening(false); speak(t.error); };
    }
    speak(t.welcome);
    setTimeout(() => speak(t.steps[0].prompt), 6000);
  }, [language, processInput, speak, t.error, t.steps, t.welcome]);

  const handleScreenTap = () => {
    if (isListening) return;
    if (recognitionRef.current) { setIsListening(true); recognitionRef.current.start(); }
    else { setIsListening(true); setTimeout(() => processInput("بيانات تجريبية"), 3000); }
  };

  return (
    <div className={`min-h-screen bg-[#E3DAD1] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} cursor-pointer`} onClick={handleScreenTap}>
      <div className="text-center space-y-16">
        <div className={`w-72 h-72 rounded-full border-[12px] border-[#304B60]/10 flex items-center justify-center mx-auto transition-all duration-700 ${isListening ? 'scale-110 border-[#304B60] bg-[#304B60]/5 shadow-2xl' : 'scale-100'}`}>
          <div className={`text-9xl transition-all duration-500 ${isListening ? 'opacity-100' : 'opacity-20'}`}>🎙️</div>
        </div>
        <div className="space-y-6">
          <h2 className="text-[#304B60] text-4xl font-black tracking-tight animate-pulse">
            {isListening ? t.listening : t.tapToTalk}
          </h2>
          <div className="flex justify-center gap-6">
            {t.steps.map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all duration-500 ${i === step ? 'bg-[#D48161] scale-150' : 'bg-[#304B60]/10'}`}></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-12 text-[#304B60]/20 font-black text-sm uppercase tracking-[0.3em] italic">Careerak Voice Assist</div>
      </div>
    </div>
  );
}
