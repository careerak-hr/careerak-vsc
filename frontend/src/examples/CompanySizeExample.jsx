import React, { useState } from 'react';

/**
 * مثال على استخدام ميزة حجم الشركة
 * 
 * هذا المثال يوضح:
 * 1. كيفية عرض حجم الشركة
 * 2. كيفية تحديث حجم الشركة
 * 3. التحديد التلقائي للحجم
 */

const CompanySizeExample = () => {
  const [employeeCount, setEmployeeCount] = useState(150);
  const [size, setSize] = useState('medium');
  const [loading, setLoading] = useState(false);

  // دالة لتحديد الحجم محلياً (للعرض فقط)
  const determineSize = (count) => {
    if (count < 50) return 'small';
    if (count <= 500) return 'medium';
    return 'large';
  };

  // دالة للحصول على تسمية الحجم
  const getSizeLabel = (size) => {
    const labels = {
      small: 'صغيرة',
      medium: 'متوسطة',
      large: 'كبيرة'
    };
    return labels[size] || size;
  };

  // دالة للحصول على لون الحجم
  const getSizeColor = (size) => {
    const colors = {
      small: '#1976d2',
      medium: '#f57c00',
      large: '#388e3c'
    };
    return colors[size] || '#666';
  };

  // دالة لتحديث حجم الشركة
  const updateCompanySize = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/companies/507f1f77bcf86cd799439011/info`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ employeeCount })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSize(data.data.size);
        alert('تم تحديث حجم الشركة بنجاح!');
      }
    } catch (error) {
      console.error('Error updating company size:', error);
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  // تحديث الحجم محلياً عند تغيير عدد الموظفين
  const handleEmployeeCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setEmployeeCount(count);
    setSize(determineSize(count));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>مثال على ميزة حجم الشركة</h2>

      {/* عرض الحجم الحالي */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>الحجم الحالي</h3>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: getSizeColor(size) + '20',
          color: getSizeColor(size),
          borderRadius: '16px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {getSizeLabel(size)}
        </div>
        <p style={{ marginTop: '10px', color: '#666' }}>
          عدد الموظفين: {employeeCount}
        </p>
      </div>

      {/* تحديث عدد الموظفين */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          عدد الموظفين:
        </label>
        <input
          type="number"
          value={employeeCount}
          onChange={handleEmployeeCountChange}
          min="0"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          الحجم سيتم تحديده تلقائياً: {getSizeLabel(determineSize(employeeCount))}
        </p>
      </div>

      {/* زر التحديث */}
      <button
        onClick={updateCompanySize}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: loading ? '#ccc' : '#304B60',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'جاري التحديث...' : 'تحديث حجم الشركة'}
      </button>

      {/* جدول التصنيفات */}
      <div style={{ marginTop: '30px' }}>
        <h3>التصنيفات</h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '10px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                الحجم
              </th>
              <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                عدد الموظفين
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  صغيرة
                </span>
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                أقل من 50
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#fff3e0',
                  color: '#f57c00',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  متوسطة
                </span>
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                50 - 500
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e8f5e9',
                  color: '#388e3c',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}>
                  كبيرة
                </span>
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                أكثر من 500
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* أمثلة */}
      <div style={{ marginTop: '30px' }}>
        <h3>أمثلة سريعة</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleEmployeeCountChange({ target: { value: '25' } })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            25 موظف (صغيرة)
          </button>
          <button
            onClick={() => handleEmployeeCountChange({ target: { value: '200' } })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fff3e0',
              color: '#f57c00',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            200 موظف (متوسطة)
          </button>
          <button
            onClick={() => handleEmployeeCountChange({ target: { value: '1000' } })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e8f5e9',
              color: '#388e3c',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            1000 موظف (كبيرة)
          </button>
        </div>
      </div>

      {/* ملاحظات */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '4px',
        border: '1px solid #ffc107'
      }}>
        <h4 style={{ marginTop: 0 }}>💡 ملاحظات مهمة</h4>
        <ul style={{ marginBottom: 0, paddingRight: '20px' }}>
          <li>الحجم يتم تحديده تلقائياً بناءً على عدد الموظفين</li>
          <li>لا حاجة لتحديد الحجم يدوياً</li>
          <li>التحديث يتطلب مصادقة (token)</li>
          <li>فقط صاحب الشركة يمكنه التحديث</li>
        </ul>
      </div>
    </div>
  );
};

export default CompanySizeExample;
