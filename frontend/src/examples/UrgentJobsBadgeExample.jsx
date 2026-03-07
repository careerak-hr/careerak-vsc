/**
 * مثال على استخدام Badge "عاجل" للوظائف
 * يوضح كيفية عرض Badge على الوظائف العاجلة
 */

import React, { useState } from 'react';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import { isUrgentJob, getRelativeTime } from '../utils/dateUtils';

const UrgentJobsBadgeExample = () => {
  // بيانات تجريبية
  const [jobs] = useState([
    {
      id: 1,
      title: 'مهندس Backend Senior',
      company: { name: 'شركة التقنية', logo: null },
      location: { city: 'الرياض' },
      salary: 15000,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 أيام
      isUrgent: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // منذ 5 أيام
    },
    {
      id: 2,
      title: 'مصمم UI/UX',
      company: { name: 'شركة الإبداع', logo: null },
      location: { city: 'جدة' },
      salary: 12000,
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 يوم
      isUrgent: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // منذ يومين
    },
    {
      id: 3,
      title: 'مطور Frontend',
      company: { name: 'شركة الويب', logo: null },
      location: { city: 'الدمام' },
      salary: 10000,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 يوم
      isUrgent: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // منذ يوم
    },
    {
      id: 4,
      title: 'مدير مشاريع',
      company: { name: 'شركة الإدارة', logo: null },
      location: { city: 'الخبر' },
      salary: 18000,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
      isUrgent: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // منذ 10 أيام
    }
  ]);

  // حساب الأيام المتبقية
  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // تنسيق الراتب
  const formatSalary = (salary) => {
    return `${salary.toLocaleString('ar-SA')} ريال`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <AlertCircle size={32} style={{ marginLeft: '12px' }} />
          Badge "عاجل" للوظائف
        </h1>
        <p style={styles.subtitle}>
          يظهر Badge "عاجل" تلقائياً على الوظائف التي تنتهي خلال 7 أيام أو أقل
        </p>
      </div>

      {/* قائمة الوظائف */}
      <div style={styles.jobsGrid}>
        {jobs.map(job => {
          const daysRemaining = getDaysRemaining(job.expiryDate);
          const isUrgent = isUrgentJob(job.expiryDate);

          return (
            <div key={job.id} style={styles.jobCard}>
              {/* Header مع Badges */}
              <div style={styles.jobHeader}>
                <div style={styles.companyLogo}>
                  {job.company.name.charAt(0)}
                </div>
                
                <div style={styles.jobTitleSection}>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.companyName}>{job.company.name}</p>
                </div>

                {/* Badges */}
                <div style={styles.badges}>
                  {isUrgent && (
                    <span style={styles.badgeUrgent}>عاجل</span>
                  )}
                </div>
              </div>

              {/* معلومات الوظيفة */}
              <div style={styles.jobInfo}>
                <div style={styles.infoRow}>
                  <Clock size={16} style={{ color: '#D48161' }} />
                  <span>{job.location.city}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <Calendar size={16} style={{ color: '#D48161' }} />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              </div>

              {/* معلومات الانتهاء */}
              <div style={{
                ...styles.expiryInfo,
                backgroundColor: isUrgent ? '#fef2f2' : '#f0fdf4',
                borderColor: isUrgent ? '#ef4444' : '#10b981'
              }}>
                <div style={styles.expiryRow}>
                  <strong>تاريخ الانتهاء:</strong>
                  <span>{new Date(job.expiryDate).toLocaleDateString('ar-SA')}</span>
                </div>
                
                <div style={styles.expiryRow}>
                  <strong>الأيام المتبقية:</strong>
                  <span style={{ 
                    color: isUrgent ? '#ef4444' : '#10b981',
                    fontWeight: 'bold'
                  }}>
                    {daysRemaining} {daysRemaining === 1 ? 'يوم' : 'أيام'}
                  </span>
                </div>
                
                <div style={styles.expiryRow}>
                  <strong>الحالة:</strong>
                  <span style={{ 
                    color: isUrgent ? '#ef4444' : '#10b981',
                    fontWeight: 'bold'
                  }}>
                    {isUrgent ? '⚠️ عاجل' : '✅ عادي'}
                  </span>
                </div>
              </div>

              {/* زر التقديم */}
              <button style={{
                ...styles.applyButton,
                backgroundColor: isUrgent ? '#ef4444' : '#304B60'
              }}>
                {isUrgent ? 'تقديم سريع ⚡' : 'تقديم'}
              </button>
            </div>
          );
        })}
      </div>

      {/* شرح الميزة */}
      <div style={styles.explanation}>
        <h2 style={styles.explanationTitle}>كيف يعمل Badge "عاجل"؟</h2>
        
        <div style={styles.explanationGrid}>
          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>✅</div>
            <h3 style={styles.explanationCardTitle}>حساب تلقائي</h3>
            <p style={styles.explanationCardText}>
              يحسب Backend تلقائياً إذا كانت الوظيفة عاجلة بناءً على تاريخ الانتهاء
            </p>
          </div>

          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>⏰</div>
            <h3 style={styles.explanationCardTitle}>7 أيام أو أقل</h3>
            <p style={styles.explanationCardText}>
              Badge يظهر فقط على الوظائف التي تنتهي خلال 7 أيام أو أقل
            </p>
          </div>

          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>🔄</div>
            <h3 style={styles.explanationCardTitle}>تحديث دوري</h3>
            <p style={styles.explanationCardText}>
              Cron job يحدث الحالة كل 6 ساعات ويغلق الوظائف المنتهية تلقائياً
            </p>
          </div>

          <div style={styles.explanationCard}>
            <div style={styles.explanationIcon}>🎯</div>
            <h3 style={styles.explanationCardTitle}>تحديد الأولويات</h3>
            <p style={styles.explanationCardText}>
              يساعد الباحثين عن عمل على تحديد الوظائف ذات الأولوية والتقديم السريع
            </p>
          </div>
        </div>

        {/* منطق الحساب */}
        <div style={styles.logicBox}>
          <h3 style={styles.logicTitle}>منطق الحساب</h3>
          <pre style={styles.codeBlock}>
{`const now = new Date();
const expiry = new Date(job.expiryDate);
const diffMs = expiry - now;
const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

// عاجل إذا كان متبقي 1-7 أيام
job.isUrgent = diffDays > 0 && diffDays <= 7;`}
          </pre>
        </div>

        {/* أمثلة */}
        <div style={styles.examplesBox}>
          <h3 style={styles.examplesTitle}>أمثلة</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الأيام المتبقية</th>
                <th style={styles.th}>isUrgent</th>
                <th style={styles.th}>Badge</th>
                <th style={styles.th}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>1</td>
                <td style={styles.td}>✅ true</td>
                <td style={styles.td}><span style={styles.badgeUrgent}>عاجل</span></td>
                <td style={styles.td}>يظهر</td>
              </tr>
              <tr>
                <td style={styles.td}>5</td>
                <td style={styles.td}>✅ true</td>
                <td style={styles.td}><span style={styles.badgeUrgent}>عاجل</span></td>
                <td style={styles.td}>يظهر</td>
              </tr>
              <tr>
                <td style={styles.td}>7</td>
                <td style={styles.td}>✅ true</td>
                <td style={styles.td}><span style={styles.badgeUrgent}>عاجل</span></td>
                <td style={styles.td}>يظهر</td>
              </tr>
              <tr>
                <td style={styles.td}>8</td>
                <td style={styles.td}>❌ false</td>
                <td style={styles.td}>-</td>
                <td style={styles.td}>لا يظهر</td>
              </tr>
              <tr>
                <td style={styles.td}>15</td>
                <td style={styles.td}>❌ false</td>
                <td style={styles.td}>-</td>
                <td style={styles.td}>لا يظهر</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// التنسيقات
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'Amiri, serif',
    direction: 'rtl'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    lineHeight: '1.6'
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '60px'
  },
  jobCard: {
    backgroundColor: '#E3DAD1',
    border: '2px solid transparent',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  jobHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative'
  },
  companyLogo: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#304B60',
    color: '#E3DAD1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  jobTitleSection: {
    flex: 1,
    minWidth: 0
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#304B60',
    margin: '0 0 4px 0'
  },
  companyName: {
    fontSize: '14px',
    color: 'rgba(48, 75, 96, 0.7)',
    margin: 0
  },
  badges: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    gap: '6px'
  },
  badgeUrgent: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  jobInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'rgba(48, 75, 96, 0.7)'
  },
  expiryInfo: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid',
    marginBottom: '16px'
  },
  expiryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  applyButton: {
    width: '100%',
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  explanation: {
    marginTop: '60px'
  },
  explanationTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '24px',
    textAlign: 'center'
  },
  explanationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  explanationCard: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  explanationIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  explanationCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#304B60',
    marginBottom: '8px'
  },
  explanationCardText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  },
  logicBox: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '40px'
  },
  logicTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#304B60',
    marginBottom: '16px'
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    direction: 'ltr',
    textAlign: 'left',
    overflow: 'auto'
  },
  examplesBox: {
    backgroundColor: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px'
  },
  examplesTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#304B60',
    marginBottom: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#304B60',
    color: 'white',
    padding: '12px',
    textAlign: 'center',
    fontWeight: '600'
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd'
  }
};

export default UrgentJobsBadgeExample;
