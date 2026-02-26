/**
 * Admin RTL Example Component
 * 
 * This component demonstrates RTL (Right-to-Left) support for the admin dashboard
 * with Arabic content. It showcases various UI elements in RTL mode.
 */

import React, { useState } from 'react';
import { useAdminTheme } from '../hooks/useAdminTheme';
import '../styles/adminTheme.css';
import '../styles/adminRTL.css';

const AdminRTLExample = () => {
  const { getInlineStyles, getButtonStyles, getCardStyles, getInputStyles, getBadgeStyles } = useAdminTheme();
  const [direction, setDirection] = useState('rtl');
  
  // Toggle between LTR and RTL
  const toggleDirection = () => {
    setDirection(prev => prev === 'rtl' ? 'ltr' : 'rtl');
  };
  
  // Sample data in Arabic
  const arabicData = {
    title: 'لوحة تحكم الأدمن',
    subtitle: 'مرحباً بك في لوحة التحكم',
    stats: [
      { label: 'المستخدمون النشطون', value: '1,234', trend: '+12%' },
      { label: 'الوظائف المنشورة', value: '567', trend: '+8%' },
      { label: 'الطلبات اليوم', value: '89', trend: '+15%' },
      { label: 'الدورات المسجلة', value: '345', trend: '+5%' },
    ],
    tableHeaders: ['الاسم', 'البريد الإلكتروني', 'النوع', 'الحالة', 'الإجراءات'],
    tableData: [
      { name: 'أحمد محمد', email: 'ahmed@example.com', type: 'باحث عن عمل', status: 'نشط' },
      { name: 'فاطمة علي', email: 'fatima@example.com', type: 'شركة', status: 'نشط' },
      { name: 'محمود حسن', email: 'mahmoud@example.com', type: 'مستقل', status: 'معطل' },
    ],
    activities: [
      { action: 'تسجيل مستخدم جديد', user: 'أحمد محمد', time: 'منذ 5 دقائق' },
      { action: 'نشر وظيفة جديدة', user: 'شركة التقنية', time: 'منذ 15 دقيقة' },
      { action: 'تقديم طلب توظيف', user: 'فاطمة علي', time: 'منذ 30 دقيقة' },
    ],
    buttons: {
      primary: 'حفظ التغييرات',
      secondary: 'إلغاء',
      accent: 'تصدير البيانات',
    },
  };
  
  return (
    <div dir={direction} style={getInlineStyles({ padding: '2rem', minHeight: '100vh' })}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {arabicData.title}
          </h1>
          <p style={{ color: 'var(--admin-text-secondary)' }}>
            {arabicData.subtitle}
          </p>
        </div>
        <button onClick={toggleDirection} style={getButtonStyles('accent')}>
          {direction === 'rtl' ? 'Switch to LTR' : 'التبديل إلى RTL'}
        </button>
      </div>
      
      {/* Statistics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {arabicData.stats.map((stat, index) => (
          <div key={index} style={getCardStyles()}>
            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={getBadgeStyles('success')}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>
      
      {/* Form Example */}
      <div style={getCardStyles({ marginBottom: '2rem' })}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          نموذج البحث
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              البحث عن مستخدم
            </label>
            <input 
              type="text" 
              placeholder="أدخل الاسم أو البريد الإلكتروني..."
              style={getInputStyles()}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
            <button style={getButtonStyles('primary')}>
              {arabicData.buttons.primary}
            </button>
            <button style={getButtonStyles('secondary')}>
              {arabicData.buttons.secondary}
            </button>
            <button style={getButtonStyles('accent')}>
              {arabicData.buttons.accent}
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Example */}
      <div style={getCardStyles({ marginBottom: '2rem' })}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          قائمة المستخدمين
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {arabicData.tableHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {arabicData.tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.type}</td>
                  <td>
                    <span style={getBadgeStyles(row.status === 'نشط' ? 'success' : 'error')}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ ...getButtonStyles('primary'), padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                        عرض
                      </button>
                      <button style={{ ...getButtonStyles('accent'), padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                        تعديل
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Activity Log */}
      <div style={getCardStyles()}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          سجل النشاطات
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {arabicData.activities.map((activity, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--admin-surface-alt)',
                borderRadius: 'var(--admin-radius-md)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                  {activity.action}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                  بواسطة: {activity.user}
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Badges Example */}
      <div style={getCardStyles({ marginTop: '2rem' })}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          أمثلة على الشارات
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={getBadgeStyles('primary')}>أساسي</span>
          <span style={getBadgeStyles('success')}>نجاح</span>
          <span style={getBadgeStyles('error')}>خطأ</span>
          <span style={getBadgeStyles('warning')}>تحذير</span>
          <span style={getBadgeStyles('info')}>معلومات</span>
        </div>
      </div>
    </div>
  );
};

export default AdminRTLExample;
