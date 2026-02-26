import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './ReportView.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UsersReportView = ({ dateRange, fontStyle }) => {
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

      const response = await fetch(`/api/admin/reports/users?${params}`, {
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
    link.download = `users-report-${new Date().toISOString().split('T')[0]}.json`;
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
  const userTypeData = {
    labels: Object.keys(reportData.byType).map(type => 
      type === 'jobSeeker' ? (language === 'ar' ? 'باحث عن عمل' : language === 'fr' ? 'Chercheur d\'emploi' : 'Job Seeker') :
      type === 'company' ? (language === 'ar' ? 'شركة' : language === 'fr' ? 'Entreprise' : 'Company') :
      type === 'freelancer' ? (language === 'ar' ? 'مستقل' : language === 'fr' ? 'Freelance' : 'Freelancer') : type
    ),
    datasets: [{
      data: Object.values(reportData.byType),
      backgroundColor: ['#304B60', '#D48161', '#E3DAD1'],
      borderColor: ['#304B60', '#D48161', '#E3DAD1'],
      borderWidth: 2
    }]
  };

  return (
    <div className="report-view" style={fontStyle}>
      {/* Header with Export Button */}
      <div className="report-view-header">
        <h2 style={fontStyle}>
          {language === 'ar' ? 'تقرير المستخدمين' : language === 'fr' ? 'Rapport des utilisateurs' : 'Users Report'}
        </h2>
        <button className="export-btn" onClick={exportReport} style={fontStyle}>
          {language === 'ar' ? 'تصدير التقرير' : language === 'fr' ? 'Exporter le rapport' : 'Export Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'إجمالي المستخدمين' : language === 'fr' ? 'Total des utilisateurs' : 'Total Users'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.totalUsers}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'معدل النمو' : language === 'fr' ? 'Taux de croissance' : 'Growth Rate'}
          </h3>
          <p className={`summary-value ${reportData.growthRate >= 0 ? 'positive' : 'negative'}`} style={fontStyle}>
            {reportData.growthRate >= 0 ? '+' : ''}{reportData.growthRate}%
          </p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'المستخدمون غير النشطين' : language === 'fr' ? 'Utilisateurs inactifs' : 'Inactive Users'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.inactive.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="report-charts">
        <div className="chart-container">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'توزيع المستخدمين حسب النوع' : language === 'fr' ? 'Distribution par type' : 'Users by Type'}
          </h3>
          <Pie data={userTypeData} options={{ maintainAspectRatio: true, responsive: true }} />
        </div>
      </div>

      {/* Most Active Users Table */}
      <div className="report-table-section">
        <h3 style={fontStyle}>
          {language === 'ar' ? 'المستخدمون الأكثر نشاطاً' : language === 'fr' ? 'Utilisateurs les plus actifs' : 'Most Active Users'}
        </h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={fontStyle}>{language === 'ar' ? 'الاسم' : language === 'fr' ? 'Nom' : 'Name'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'النوع' : language === 'fr' ? 'Type' : 'Type'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'عدد الأنشطة' : language === 'fr' ? 'Activités' : 'Activity Count'}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.mostActive.map((user, index) => (
                <tr key={index}>
                  <td style={fontStyle}>{user.name}</td>
                  <td style={fontStyle}>{user.email}</td>
                  <td style={fontStyle}>{user.userType}</td>
                  <td style={fontStyle}>{user.activityCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inactive Users Table */}
      {reportData.inactive.length > 0 && (
        <div className="report-table-section">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'المستخدمون غير النشطين' : language === 'fr' ? 'Utilisateurs inactifs' : 'Inactive Users'}
          </h3>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th style={fontStyle}>{language === 'ar' ? 'الاسم' : language === 'fr' ? 'Nom' : 'Name'}</th>
                  <th style={fontStyle}>{language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email'}</th>
                  <th style={fontStyle}>{language === 'ar' ? 'النوع' : language === 'fr' ? 'Type' : 'Type'}</th>
                  <th style={fontStyle}>{language === 'ar' ? 'آخر تسجيل دخول' : language === 'fr' ? 'Dernière connexion' : 'Last Login'}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.inactive.map((user, index) => (
                  <tr key={index}>
                    <td style={fontStyle}>{user.name}</td>
                    <td style={fontStyle}>{user.email}</td>
                    <td style={fontStyle}>{user.userType}</td>
                    <td style={fontStyle}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersReportView;
