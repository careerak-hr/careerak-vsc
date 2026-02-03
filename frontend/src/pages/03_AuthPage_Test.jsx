import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPageTest() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    city: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(`Input changed: ${name} = ${value}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('تم إرسال النموذج بنجاح!');
  };

  // أبسط الأساليب الممكنة
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#E3DAD1',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: 'white',
    border: '2px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    // إجبار التفاعل
    pointerEvents: 'auto',
    cursor: 'text',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    touchAction: 'manipulation',
    WebkitTouchCallout: 'default',
    WebkitUserModify: 'read-write'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#304B60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px' }}>
        
        <h1 style={{ textAlign: 'center', color: '#304B60', marginBottom: '30px' }}>
          اختبار الحقول
        </h1>

        {/* اختيار نوع المستخدم */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setUserType('individual')}
            style={{
              ...buttonStyle,
              backgroundColor: userType === 'individual' ? '#304B60' : '#ccc',
              marginRight: '10px',
              width: '48%'
            }}
          >
            فرد
          </button>
          <button
            onClick={() => setUserType('company')}
            style={{
              ...buttonStyle,
              backgroundColor: userType === 'company' ? '#304B60' : '#ccc',
              width: '48%'
            }}
          >
            شركة
          </button>
        </div>

        {userType && (
          <form onSubmit={handleSubmit}>
            
            {/* اختبار حقل نص بسيط */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                الاسم الأول:
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="اكتب اسمك الأول هنا"
                style={inputStyle}
                autoComplete="off"
              />
            </div>

            {/* اختبار حقل نص آخر */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                الاسم الأخير:
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="اكتب اسمك الأخير هنا"
                style={inputStyle}
                autoComplete="off"
              />
            </div>

            {/* اختبار حقل إيميل */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                style={inputStyle}
                autoComplete="off"
              />
            </div>

            {/* اختبار قائمة منسدلة */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                البلد:
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                style={selectStyle}
              >
                <option value="">اختر البلد</option>
                <option value="syria">سوريا</option>
                <option value="lebanon">لبنان</option>
                <option value="jordan">الأردن</option>
                <option value="egypt">مصر</option>
              </select>
            </div>

            {/* اختبار حقل كلمة مرور */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                كلمة المرور:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="اكتب كلمة المرور"
                style={inputStyle}
                autoComplete="off"
              />
            </div>

            {/* زر الإرسال */}
            <button type="submit" style={buttonStyle}>
              إرسال النموذج
            </button>

            {/* عرض البيانات المدخلة */}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>البيانات المدخلة:</h3>
              <p><strong>الاسم الأول:</strong> {formData.firstName || 'فارغ'}</p>
              <p><strong>الاسم الأخير:</strong> {formData.lastName || 'فارغ'}</p>
              <p><strong>الإيميل:</strong> {formData.email || 'فارغ'}</p>
              <p><strong>البلد:</strong> {formData.country || 'فارغ'}</p>
              <p><strong>كلمة المرور:</strong> {formData.password ? '***' : 'فارغ'}</p>
            </div>

            {/* زر العودة */}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              style={{
                ...buttonStyle,
                backgroundColor: '#ccc',
                color: '#333',
                marginTop: '20px'
              }}
            >
              العودة لتسجيل الدخول
            </button>

          </form>
        )}
      </div>
    </div>
  );
}