import React, { useState } from 'react';

export default function TestInputPage() {
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [date, setDate] = useState('');
  const [select, setSelect] = useState('');

  return (
    <div style={{ padding: '50px', backgroundColor: '#E3DAD1', minHeight: '100vh' }}>
      <h1>اختبار حقول الإدخال</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>حقل نص:</label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            margin: '10px 0',
            border: '2px solid #304B60',
            borderRadius: '10px'
          }}
          placeholder="اكتب هنا..."
        />
        <p>القيمة: {text}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>بريد إلكتروني:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            margin: '10px 0',
            border: '2px solid #304B60',
            borderRadius: '10px'
          }}
          placeholder="email@example.com"
        />
        <p>القيمة: {email}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>كلمة مرور:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            margin: '10px 0',
            border: '2px solid #304B60',
            borderRadius: '10px'
          }}
          placeholder="كلمة المرور"
        />
        <p>القيمة: {password}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>تاريخ الميلاد:</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            margin: '10px 0',
            border: '2px solid #304B60',
            borderRadius: '10px'
          }}
        />
        <p>القيمة: {date}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>قائمة منسدلة:</label>
        <select 
          value={select} 
          onChange={(e) => setSelect(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            margin: '10px 0',
            border: '2px solid #304B60',
            borderRadius: '10px'
          }}
        >
          <option value="">اختر...</option>
          <option value="option1">خيار 1</option>
          <option value="option2">خيار 2</option>
          <option value="option3">خيار 3</option>
        </select>
        <p>القيمة: {select}</p>
      </div>

      <button 
        onClick={() => alert('الزر يعمل!')}
        style={{
          padding: '15px 30px',
          backgroundColor: '#304B60',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      >
        اختبار الزر
      </button>
    </div>
  );
}