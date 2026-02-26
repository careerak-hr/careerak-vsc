import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import './ReportView.css';

const JobsReportView = ({ dateRange, fontStyle }) => {
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

      const response = await fetch(`/api/admin/reports/jobs?${params}`, {
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
    link.download = `jobs-report-${new Date().toISOString().split('T')[0]}.json`;
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
  const jobsByFieldData = {
    labels: Object.keys(reportData.byField),
    datasets: [{
      label: language === 'ar' ? 'عدد الوظائف' : language === 'fr' ? 'Nombre d\'emplois' : 'Number of Jobs',
      data: Object.values(reportData.byField),
      backgroundColor: '#D48161',
      borderColor: '#D48161',
      borderWidth: 2
    }]
  };

  return (
    <div className="report-view" style={fontStyle}>
      {/* Header with Export Button */}
      <div className="report-view-header">
        <h2 style={fontStyle}>
          {language === 'ar' ? 'تقرير الوظائف' : language === 'fr' ? 'Rapport des emplois' : 'Jobs Report'}
        </h2>
        <button className="export-btn" onClick={exportReport} style={fontStyle}>
          {language === 'ar' ? 'تصدير التقرير' : language === 'fr' ? 'Exporter le rapport' : 'Export Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'إجمالي الوظائف' : language === 'fr' ? 'Total des emplois' : 'Total Jobs'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.totalJobs}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'معدل التقديم' : language === 'fr' ? 'Taux de candidature' : 'Application Rate'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.applicationRate}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'المجالات' : language === 'fr' ? 'Domaines' : 'Fields'}
          </h3>
          <p className="summary-value" style={fontStyle}>{Object.keys(reportData.byField).length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="report-charts">
        <div className="chart-container">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'الوظائف حسب المجال' : language === 'fr' ? 'Emplois par domaine' : 'Jobs by Field'}
          </h3>
          <Bar 
            data={jobsByFieldData} 
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

      {/* Most Popular Jobs Table */}
      <div className="report-table-section">
        <h3 style={fontStyle}>
          {language === 'ar' ? 'الوظائف الأكثر شعبية' : language === 'fr' ? 'Emplois les plus populaires' : 'Most Popular Jobs'}
        </h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={fontStyle}>{language === 'ar' ? 'العنوان' : language === 'fr' ? 'Titre' : 'Title'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'المجال' : language === 'fr' ? 'Domaine' : 'Field'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'عدد التقديمات' : language === 'fr' ? 'Candidatures' : 'Applications'}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.mostPopular.map((job, index) => (
                <tr key={index}>
                  <td style={fontStyle}>{job.title}</td>
                  <td style={fontStyle}>{job.field}</td>
                  <td style={fontStyle}>{job.applicationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most Active Companies Table */}
      <div className="report-table-section">
        <h3 style={fontStyle}>
          {language === 'ar' ? 'الشركات الأكثر نشاطاً' : language === 'fr' ? 'Entreprises les plus actives' : 'Most Active Companies'}
        </h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={fontStyle}>{language === 'ar' ? 'اسم الشركة' : language === 'fr' ? 'Nom de l\'entreprise' : 'Company Name'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'عدد الوظائف' : language === 'fr' ? 'Nombre d\'emplois' : 'Job Count'}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.mostActiveCompanies.map((company, index) => (
                <tr key={index}>
                  <td style={fontStyle}>{company.companyName}</td>
                  <td style={fontStyle}>{company.jobCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobsReportView;
