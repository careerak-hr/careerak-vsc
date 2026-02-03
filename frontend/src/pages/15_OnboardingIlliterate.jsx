import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import onboardingIlliterateTranslations from '../data/onboardingIlliterateTranslations.json';
import './15_OnboardingIlliterate.css';

export default function OnboardingIlliterate() {
  const navigate = useNavigate();
  const { language, updateUser, startBgMusic } = useAuth();
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef(null);

  const t = onboardingIlliterateTranslations[language || 'ar'];

  const steps = useMemo(() => [
    { id: 'bio', icon: '👤', voice: '/voices/tell_us_about_you.mp3', color: 'bg-[#304B60]' },
    { id: 'skills', icon: '🛠️', voice: '/voices/what_are_your_skills.mp3', color: 'bg-[#D48161]' },
    { id: 'experience', icon: '💼', voice: '/voices/your_experience.mp3', color: 'bg-[#304B60]' },
    { id: 'finish', icon: '✅', voice: '/voices/all_done.mp3', color: 'bg-[#D48161]' }
  ], []);

  const playInstruction = useCallback((index) => {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(steps[index].voice);
    audioRef.current.play().catch(e => console.log("Audio play failed"));
  }, [steps]);

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    playInstruction(0);
  }, [playInstruction, startBgMusic]);

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
    <div className={`onboarding-illiterate-container ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="onboarding-illiterate-card">
        <div className={`onboarding-illiterate-icon-container ${steps[step].color}`}>
          <span className="onboarding-illiterate-icon">{steps[step].icon}</span>
        </div>

        <div className="onboarding-illiterate-progress-container">
          <div className="onboarding-illiterate-progress-dots">
            {steps.map((_, i) => (
              <div key={i} className={`onboarding-illiterate-progress-dot ${i === step ? 'bg-[#304B60] w-8' : 'bg-[#304B60]/10'}`}></div>
            ))}
          </div>
        </div>

        <button
          onClick={handleMicClick}
          className={`onboarding-illiterate-mic-btn ${isRecording ? 'bg-red-600 animate-ping' : 'bg-[#304B60]'}`}
        >
          <span className="onboarding-illiterate-mic-icon">{isRecording ? '⏹️' : '🎤'}</span>
        </button>

        <p className="onboarding-illiterate-status-text">
          {isRecording ? t.listening : t.tapSpeak}
        </p>
      </div>
    </div>
  );
}