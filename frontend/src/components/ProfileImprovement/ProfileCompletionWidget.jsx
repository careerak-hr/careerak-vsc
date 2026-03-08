import React from 'react';
import { useTranslation } from 'react-i18next';
import './ProfileImprovement.css';

/**
 * Widget to display profile completion percentage
 * Requirements: 2.2
 */
const ProfileCompletionWidget = ({ completion }) => {
  const { t } = useTranslation();

  if (!completion) return null;

  const percentage = completion.completionPercentage;

  const getStatusColor = (percent) => {
    if (percent < 50) return '#ef4444'; // Red
    if (percent < 80) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getStatusClass = (percent) => {
    if (percent < 50) return 'status-poor';
    if (percent < 80) return 'status-fair';
    return 'status-excellent';
  };

  const sectionLabels = {
    profilePicture: 'الصورة الشخصية',
    about: 'نبذة عني',
    skills: 'المهارات',
    experience: 'الخبرة العملية',
    education: 'التعليم',
    portfolio: 'معرض الأعمال',
    socialLinks: 'روابط التواصل',
    certifications: 'الشهادات'
  };

  return (
    <div className="completion-widget">
      <div className="completion-header">
        <h3 className="font-amiri text-xl">اكتمال الملف الشخصي</h3>
        <span
          className={`completion-badge ${getStatusClass(percentage)}`}
          style={{ backgroundColor: getStatusColor(percentage) }}
        >
          {percentage}%
        </span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getStatusColor(percentage)
          }}
        />
      </div>

      <div className="completion-sections mt-4 space-y-2">
        {Object.entries(completion.sections).map(([key, section]) => (
          <div key={key} className="section-item flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className={section.completed ? 'text-green-500' : 'text-gray-300'}>
                {section.completed ? '✓' : '○'}
              </span>
              <span className={section.completed ? 'text-primary' : 'text-gray-500'}>
                {sectionLabels[key] || key}
              </span>
            </div>
            <span className="text-gray-400 text-xs">{section.weight}%</span>
          </div>
        ))}
      </div>

      {percentage === 100 && (
        <div className="completion-celebration mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-center font-bold">
          🎉 رائع! ملفك الشخصي مكتمل 100%
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionWidget;
