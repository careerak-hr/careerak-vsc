import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

export default function OnboardingIlliterate() {
  const navigate = useNavigate();
  const { language, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    playInstruction(0);
  }, []);

  const steps = [
    { id: 'bio', icon: '👤', voice: '/voices/tell_us_about_you.mp3', color: 'bg-blue-500' },
    { id: 'skills', icon: '🛠️', voice: '/voices/what_are_your_skills.mp3', color: 'bg-green-500' },
    { id: 'experience', icon: '💼', voice: '/voices/your_experience.mp3', color: 'bg-purple-500' },
    { id: 'finish', icon: '✅', voice: '/voices/all_done.mp3', color: 'bg-orange-500' }
  ];

  const playInstruction = (index) => {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(steps[index].voice);
    audioRef.current.play().catch(e => console.log("Audio play failed"));
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    // هنا يتم دمج مكتبة SpeechRecognition مستقبلاً
    if (isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        if (step < steps.length - 1) {
          const nextStep = step + 1;
          setStep(nextStep);
          playInstruction(nextStep);
        } else {
          finishRegistration();
        }
      }, 2000);
    }
  };

  const finishRegistration = async () => {
    setLoading(true);
    try {
      // إرسال البيانات المسجلة صوتياً (تحت التطوير)
      const res = await userService.updateProfile({ isIlliterateMode: true });
      updateUser(res.data.user);
      navigate('/profile');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#E3DAD0] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

      <div className="w-full max-w-lg bg-white rounded-[4rem] shadow-2xl p-12 text-center border-t-8 border-[#1A365D]">

        <div className={`w-32 h-32 ${steps[step].color} rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl transition-all duration-500`}>
          <span className="text-6xl">{steps[step].icon}</span>
        </div>

        <div className="mb-12">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === step ? 'bg-[#1A365D] w-8' : 'bg-gray-200'} transition-all duration-300`}></div>
            ))}
          </div>
        </div>

        <button
          onClick={handleMicClick}
          className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 active:scale-90 shadow-2xl ${isRecording ? 'bg-red-500 animate-ping' : 'bg-[#1A365D]'}`}
        >
          <span className="text-5xl text-white">{isRecording ? '⏹️' : '🎤'}</span>
        </button>

        <p className="mt-8 text-[#1A365D] font-black text-xl">
          {isRecording ? 'جاري الاستماع... تحدّث الآن' : 'اضغط وتحدث'}
        </p>

      </div>
    </div>
  );
}
