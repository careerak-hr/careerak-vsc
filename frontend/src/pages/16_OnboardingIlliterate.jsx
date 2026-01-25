import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

export default function OnboardingIlliterate() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef(null);

  const steps = [
    { id: 'bio', icon: '👤', voice: '/voices/tell_us_about_you.mp3', color: 'bg-[#304B60]' },
    { id: 'skills', icon: '🛠️', voice: '/voices/what_are_your_skills.mp3', color: 'bg-[#D48161]' },
    { id: 'experience', icon: '💼', voice: '/voices/your_experience.mp3', color: 'bg-[#304B60]' },
    { id: 'finish', icon: '✅', voice: '/voices/all_done.mp3', color: 'bg-[#D48161]' }
  ];

  const playInstruction = useCallback((index) => {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(steps[index].voice);
    audioRef.current.play().catch(e => console.log("Audio play failed"));
  }, [steps]);

  useEffect(() => {
    setIsVisible(true);
    playInstruction(0);
  }, [playInstruction]);

  const finishRegistration = async () => {
    try {
      const res = await userService.updateProfile({ isIlliterateMode: true });
      updateUser(res.data.user);
      navigate('/profile');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
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

  return (
    <div className={`min-h-screen bg-[#E3DAD1] flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-lg bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-12 text-center border-2 border-[#304B60]/5">
        <div className={`w-32 h-32 ${steps[step].color} rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl transition-all duration-500 border-4 border-[#E3DAD1]`}>
          <span className="text-6xl">{steps[step].icon}</span>
        </div>

        <div className="mb-12">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === step ? 'bg-[#304B60] w-8' : 'bg-[#304B60]/10'} transition-all duration-300`}></div>
            ))}
          </div>
        </div>

        <button
          onClick={handleMicClick}
          className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 active:scale-90 shadow-2xl ${isRecording ? 'bg-red-600 animate-ping' : 'bg-[#304B60]'}`}
        >
          <span className="text-5xl text-[#D48161]">{isRecording ? '⏹️' : '🎤'}</span>
        </button>

        <p className="mt-8 text-[#304B60] font-black text-xl">
          {isRecording ? 'جاري الاستماع... تحدّث الآن' : 'اضغط وتحدث'}
        </p>
      </div>
    </div>
  );
}
