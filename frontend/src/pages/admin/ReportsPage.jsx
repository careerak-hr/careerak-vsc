import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import UsersReportView from '../../components/admin/reports/UsersReportView';
import JobsReportView from '../../components/admin/reports/JobsReportView';
import CoursesReportView from '../../components/admin/reports/CoursesReportView';
import ReviewsReportView from '../../components/admin/reports/ReviewsReportView';
import './ReportsPage.css';

const ReportsPage = () => {
  const { language, fontFamily } = useApp();
  const [selectedReportType, setSelectedReportType] = useState('users');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const reportTypes = [
    { id: 'users', label: { ar: 'تقرير المستخدمين', en: 'Users Report', fr: 'Rapport des utilisateurs' } },
    { id: 'jobs', label: { ar: 'تقرير الوظائف', en: 'Jobs Report', fr: 'Rapport des emplois' } },
    { id: 'courses', label: { ar: 'تقرير الدورات', en: 'Courses Report', fr: 'Rapport des cours' } },
    { id: 'reviews', label: { ar: 'تقرير التقييمات', en: 'Reviews Report', fr: 'Rapport des avis' } }
  ];

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderReportView = () => {
    const props = { dateRange, fontStyle };
    
    switch (selectedReportType) {
      case 'users':
        return <UsersReportView {...props} />;
      case 'jobs':
        return <JobsReportView {...props} />;
      case 'courses':
        return <CoursesReportView {...props} />;
      case 'reviews':
        return <ReviewsReportView {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="reports-page" style={fontStyle}>
      <div className="reports-header">
        <h1 style={fontStyle}>
          {language === 'ar' ? 'التقارير' : language === 'fr' ? 'Rapports' : 'Reports'}
        </h1>
        <p style={fontStyle}>
          {language === 'ar' 
            ? 'إنشاء وعرض تقارير مفصلة عن أداء المنصة' 
            : language === 'fr' 
            ? 'Générer et afficher des rapports détaillés sur les performances de la plateforme'
            : 'Generate and view detailed reports about platform performance'}
        </p>
      </div>

      <div className="reports-controls">
        {/* Report Type Selector */}
        <div className="report-type-selector">
          <label style={fontStyle}>
            {language === 'ar' ? 'نوع التقرير:' : language === 'fr' ? 'Type de rapport:' : 'Report Type:'}
          </label>
          <div className="report-type-buttons">
            {reportTypes.map(type => (
              <button
                key={type.id}
                className={`report-type-btn ${selectedReportType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedReportType(type.id)}
                style={fontStyle}
              >
                {type.label[language]}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="date-range-selector">
          <label style={fontStyle}>
            {language === 'ar' ? 'الفترة الزمنية:' : language === 'fr' ? 'Période:' : 'Date Range:'}
          </label>
          <div className="date-inputs">
            <div className="date-input-group">
              <label style={fontStyle}>
                {language === 'ar' ? 'من:' : language === 'fr' ? 'De:' : 'From:'}
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                style={fontStyle}
              />
            </div>
            <div className="date-input-group">
              <label style={fontStyle}>
                {language === 'ar' ? 'إلى:' : language === 'fr' ? 'À:' : 'To:'}
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                style={fontStyle}
              />
            </div>
            <button
              className="clear-dates-btn"
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              style={fontStyle}
            >
              {language === 'ar' ? 'مسح' : language === 'fr' ? 'Effacer' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Report View */}
      <div className="report-content">
        {renderReportView()}
      </div>
    </div>
  );
};

export default ReportsPage;
