import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import onboardingUltimateTranslations from '../data/onboardingUltimateTranslations.json';
import './17_OnboardingUltimate.css';

export default function OnboardingUltimate() {
  const navigate = useNavigate();
  const { language, updateUser, startBgMusic } = useAuth();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState({ name: '', skills: '', bio: '' });

  const recognitionRef = useRef(null);

  const t = onboardingUltimateTranslations[language || 'ar'];

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
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
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
  }, [language, processVoiceInput, speak, t.error, t.steps, t.welcome, startBgMusic]);

  const handleScreenTouch = () => {
    if (isListening) return;
    if (recognitionRef.current) { setIsListening(true); recognitionRef.current.start(); }
    else { setIsListening(true); setTimeout(() => processVoiceInput("بيانات تجريبية"), 3000); }
  };

  return (
    <div className={`onboarding-ultimate-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={handleScreenTouch}>
      <div className="onboarding-ultimate-mic-wrapper">
        <div className={`onboarding-ultimate-mic-container ${isListening ? 'onboarding-ultimate-mic-container-active' : ''}`}>
          <div className={`onboarding-ultimate-mic-icon ${isListening ? 'onboarding-ultimate-mic-icon-active' : 'onboarding-ultimate-mic-icon-inactive'}`}>🎙️</div>
        </div>
        {isListening && <div className="onboarding-ultimate-ping-effect"></div>}
      </div>
      <div className="onboarding-ultimate-footer">
        <h1 className="onboarding-ultimate-title">Ultimate Assist</h1>
        <p className="onboarding-ultimate-status-text">{isListening ? t.listening : t.tapToTalk}</p>
      </div>
    </div>
  );
}