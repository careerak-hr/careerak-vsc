import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import './ReportView.css';

const ReviewsReportView = ({ dateRange, fontStyle }) => {
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

      const response = await fetch(`/api/admin/reports/reviews?${params}`, {
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
    link.download = `reviews-report-${new Date().toISOString().split('T')[0]}.json`;
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
  const ratingDistributionData = {
    labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
    datasets: [{
      label: language === 'ar' ? 'عدد التقييمات' : language === 'fr' ? 'Nombre d\'avis' : 'Number of Reviews',
      data: [
        reportData.byRating[1] || 0,
        reportData.byRating[2] || 0,
        reportData.byRating[3] || 0,
        reportData.byRating[4] || 0,
        reportData.byRating[5] || 0
      ],
      backgroundColor: ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'],
      borderColor: ['#c0392b', '#d35400', '#d68910', '#27ae60', '#229954'],
      borderWidth: 2
    }]
  };

  return (
    <div className="report-view" style={fontStyle}>
      {/* Header with Export Button */}
      <div className="report-view-header">
        <h2 style={fontStyle}>
          {language === 'ar' ? 'تقرير التقييمات' : language === 'fr' ? 'Rapport des avis' : 'Reviews Report'}
        </h2>
        <button className="export-btn" onClick={exportReport} style={fontStyle}>
          {language === 'ar' ? 'تصدير التقرير' : language === 'fr' ? 'Exporter le rapport' : 'Export Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'إجمالي التقييمات' : language === 'fr' ? 'Total des avis' : 'Total Reviews'}
          </h3>
          <p className="summary-value" style={fontStyle}>{reportData.totalReviews}</p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'متوسط التقييم' : language === 'fr' ? 'Note moyenne' : 'Average Rating'}
          </h3>
          <p className="summary-value" style={fontStyle}>
            {reportData.averageRating} ⭐
          </p>
        </div>
        <div className="summary-card">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'التقييمات المبلغ عنها' : language === 'fr' ? 'Avis signalés' : 'Flagged Reviews'}
          </h3>
          <p className="summary-value warning" style={fontStyle}>{reportData.flaggedCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="report-charts">
        <div className="chart-container">
          <h3 style={fontStyle}>
            {language === 'ar' ? 'توزيع التقييمات' : language === 'fr' ? 'Distribution des notes' : 'Rating Distribution'}
          </h3>
          <Bar 
            data={ratingDistributionData} 
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

      {/* Rating Breakdown Table */}
      <div className="report-table-section">
        <h3 style={fontStyle}>
          {language === 'ar' ? 'تفصيل التقييمات' : language === 'fr' ? 'Détail des notes' : 'Rating Breakdown'}
        </h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th style={fontStyle}>{language === 'ar' ? 'التقييم' : language === 'fr' ? 'Note' : 'Rating'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'العدد' : language === 'fr' ? 'Nombre' : 'Count'}</th>
                <th style={fontStyle}>{language === 'ar' ? 'النسبة' : language === 'fr' ? 'Pourcentage' : 'Percentage'}</th>
              </tr>
            </thead>
            <tbody>
              {[5, 4, 3, 2, 1].map(rating => {
                const count = reportData.byRating[rating] || 0;
                const percentage = reportData.totalReviews > 0 
                  ? ((count / reportData.totalReviews) * 100).toFixed(1) 
                  : 0;
                return (
                  <tr key={rating}>
                    <td style={fontStyle}>{rating} ⭐</td>
                    <td style={fontStyle}>{count}</td>
                    <td style={fontStyle}>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewsReportView;
