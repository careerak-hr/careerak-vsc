import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Bar, Line } from 'react-chartjs-2';
import './ReportView.css';

const CoursesReportView = ({ dateRange, fontStyle }) => {
  const { language } = useApp();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/admin/reports/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch report');

      const data = await response.json();
      setReportData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courses-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="report-loading" style={fontStyle}>
        {language === 'ar' ? 'جاري تحميل التقرير...' : language === 'fr' ? 'Chargement du rapport...' : 'Loading report...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-error" style={fontStyle}>
        {language === 'ar' ? 'خطأ: ' : language === 'fr' ? 'Erreur: ' : 'Error: '}{error}
      </div>
    );
  }

  if (!reportData) return null;

  // Prepare chart data
  const coursesByFieldData = {
    labels: Object.keys(reportData.byField),
    datasets: [{
      label: language === 'ar' ? 'عدد الدورات' : language === 'fr' ? 'Nombre de cours' : 'Number of Courses',
      data: Object.values(reportData.byField),
      backgroundColor: '#304B60',
      borderColor: '#304B60',
      borderWidth: 2
    }]
  };

  return (
    <div className="report-view" style={fontStyle}>
      {/* Header with Export Button */}
      <div className="report-view-header">
        <h2 style={fontStyle}>
          {language === 'ar' ? 'تقرير الدورات' : language === 'fr' ? 'Rapport des cours' : 'Courses Report'}
        </h2>
        <button className="export-btn" onClick={exportReport} style={fontStyle}>
          {language === 'ar' ? 'تصدير التقرير' : language === 'fr' ? 'Exporter le rapport' : 'Export Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'إجمالي الدورات' : language === 'fr' ? 'Total des cours' : 'Total Courses'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.totalCourses}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'معدل التسجيل' : language === 'fr' ? 'Taux d\'inscription' : 'Enrollment Rate'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.enrollmentRate}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'معدل الإكمال' : language === 'fr' ? 'Taux d\'achèvement' : 'Completion Rate'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.completionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="report-charts">
        <div className="chart-container">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'الدورات حسب المجال' : language === 'fr' ? 'Cours par domaine' : 'Courses by Field'}
          </h3>
          <Bar 
            data={coursesByFieldData} 
            options={{ 
              maintainAspectRatio: true, 
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Most Popular Courses Table */}
      <div className="report-table-section">
        <h3 style={fontStyle}>
          {language === 'ar' ? 'الدورات الأكثر شعبية' : language === 'fr' ? 'Cours les plus populaires' : 'Most Popular Courses'}
        </h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={fontStyle}>{language === 'ar' ? 'العنوان' : language === 'fr' ? 'Titre' : 'Title'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'المجال' : language === 'fr' ? 'Domaine' : 'Field'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'النوع' : language === 'fr' ? 'Type' : 'Type'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'عدد المسجلين' : language === 'fr' ? 'Inscriptions' : 'Enrollments'}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.mostPopular.map((course, index) => (
                <tr key={index}>
                  <td style={fontStyle}>{course.title}</td>
                  <td style={fontStyle}>{course.field}</td>
                  <td style={fontStyle}>
                    {course.type === 'training' 
                      ? (language === 'ar' ? 'تدريبية' : language === 'fr' ? 'Formation' : 'Training')
                      : (language === 'ar' ? 'تعليمية' : language === 'fr' ? 'Éducatif' : 'Educational')
                    }
                  </td>
                  <td style={fontStyle}>{course.enrollmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoursesReportView;
