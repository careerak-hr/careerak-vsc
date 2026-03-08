import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Edit3, Save, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AboutSection.css';

/**
 * Enhanced About Section with Word Counter and Writing Tips
 * Requirements: 7.2
 */
const AboutSection = () => {
  const { user, language } = useApp();
  const [isEditing, setIsAdding] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;
  const isLengthValid = wordCount >= 100 && wordCount <= 300;

  const tips = {
    ar: [
      "ابدأ بمن أنت ومجال خبرتك الرئيسي.",
      "اذكر أهم 3 إنجازات حققتها في مسيرتك.",
      "وضح أهدافك المهنية وما تبحث عنه حالياً.",
      "اجعل أسلوبك مباشراً ومهنياً."
    ],
    en: [
      "Start with who you are and your main area of expertise.",
      "Mention your top 3 career achievements.",
      "Clarify your career goals and what you're looking for.",
      "Keep your tone direct and professional."
    ]
  };

  const currentTips = tips[language] || tips.ar;

  // Auto-save logic (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing && bio !== user?.bio) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [bio]);

  const handleSave = async () => {
    if (!bio || bio === user?.bio) return;

    setSaveStatus('saving');
    try {
      await axios.put('/api/profile/about', { bio });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Error saving bio:', err);
    }
  };

  return (
    <div className="about-section bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Edit3 className="text-accent" size={24} />
          <h2 className="text-xl font-bold text-primary dark:text-white font-amiri">نبذة عني</h2>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus === 'saving' && <span className="text-xs text-gray-400 animate-pulse">جاري الحفظ تلقائياً...</span>}
          {saveStatus === 'success' && <CheckCircle className="text-green-500" size={18} />}
          {saveStatus === 'error' && <AlertCircle className="text-red-500" size={18} />}

          <button
            onClick={() => setIsAdding(!isEditing)}
            className="btn-outline py-1 px-4 text-sm"
          >
            {isEditing ? 'معاينة' : 'تعديل'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                className="w-full h-64 p-4 rounded-xl border-2 border-accent/10 bg-secondary/10 focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white text-lg leading-relaxed"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة احترافية عنك هنا..."
              />
              <div className="flex justify-between items-center">
                <div className={`text-sm font-bold ${isLengthValid ? 'text-green-500' : 'text-yellow-600'}`}>
                  عدد الكلمات: {wordCount} (الموصى به: 100-300)
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="btn-primary py-2 px-6 flex items-center gap-2"
                >
                  <Save size={18} />
                  حفظ الآن
                </button>
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {bio || 'ابدأ بكتابة نبذة تعريفية قوية لتجذب أصحاب العمل...'}
              </p>
            </div>
          )}
        </div>

        {/* Writing Tips Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/20 p-6 rounded-2xl border border-accent/10">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Info size={20} />
              <h3 className="font-bold">نصائح للكتابة</h3>
            </div>
            <ul className="space-y-3">
              {currentTips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                  <span className="text-accent">•</span>
                  {tip}
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-dashed border-accent/20">
              <p className="text-xs text-gray-500 italic">
                "الملفات الشخصية التي تحتوي على نبذة مفصلة تزيد فرص تواصل الشركات معك بنسبة 50%."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
