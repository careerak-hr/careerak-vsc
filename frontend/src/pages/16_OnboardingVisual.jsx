import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import onboardingVisualTranslations from '../data/onboardingVisualTranslations.json';
import './16_OnboardingVisual.css';

export default function OnboardingVisual() {
  const navigate = useNavigate();
  const { language, updateUser, startBgMusic } = useAuth();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userInput, setUserInput] = useState({ name: '', profession: '', experience: '' });

  const recognitionRef = useRef(null);

  const t = onboardingVisualTranslations[language || 'ar'];

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
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
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
  }, [language, processInput, speak, t.error, t.steps, t.welcome, startBgMusic]);

  const handleScreenTap = () => {
    if (isListening) return;
    if (recognitionRef.current) { setIsListening(true); recognitionRef.current.start(); }
    else { setIsListening(true); setTimeout(() => processInput("بيانات تجريبية"), 3000); }
  };

  return (
    <div className={`onboarding-visual-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={handleScreenTap}>
      <div className="onboarding-visual-content">
        <div className={`onboarding-visual-mic-container ${isListening ? 'onboarding-visual-mic-container-active' : ''}`}>
          <div className={`onboarding-visual-mic-icon ${isListening ? 'opacity-100' : 'opacity-20'}`}>🎙️</div>
        </div>
        <div className="onboarding-visual-status-container">
          <h2 className="onboarding-visual-status-text">
            {isListening ? t.listening : t.tapToTalk}
          </h2>
          <div className="onboarding-visual-progress-dots">
            {t.steps.map((_, i) => (
              <div key={i} className={`onboarding-visual-progress-dot ${i === step ? 'onboarding-visual-progress-dot-active' : 'onboarding-visual-progress-dot-inactive'}`}></div>
            ))}
          </div>
        </div>
        <div className="onboarding-visual-footer-text">Careerak Voice Assist</div>
      </div>
    </div>
  );
}
