import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './30_AdminCodeEditor.css';

const AdminCodeEditor = () => {
  const { language, startBgMusic } = useApp();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState('');
  const [code, setCode] = useState('');
  const [fileTree] = useState([
    { path: 'frontend/src/App.jsx', type: 'file', icon: '📄' },
    { path: 'frontend/src/index.js', type: 'file', icon: '📄' },
    { path: 'frontend/src/pages/18_AdminDashboard.jsx', type: 'file', icon: '📄' },
    { path: 'frontend/src/context/AppContext.js', type: 'file', icon: '📄' },
    { path: 'frontend/src/services/api.js', type: 'file', icon: '📄' },
    { path: 'backend/src/index.js', type: 'file', icon: '🔧' },
    { path: 'backend/src/app.js', type: 'file', icon: '🔧' },
    { path: 'backend/src/models/User.js', type: 'file', icon: '🔧' },
    { path: 'package.json', type: 'file', icon: '📦' },
    { path: 'README.md', type: 'file', icon: '📖' },
  ]);

  // تشغيل الموسيقى عند فتح الصفحة
  useEffect(() => {
    if (startBgMusic) startBgMusic();
  }, [startBgMusic]);

  const loadFile = (filePath) => {
    setSelectedFile(filePath);
    // في بيئة حقيقية، سنقرأ الملف من الخادم
    setCode(`// محتوى الملف: ${filePath}\n// هذا محرر تجريبي\n// في الإنتاج، سيتم تحميل المحتوى الفعلي من الخادم\n\nconsole.log('File loaded: ${filePath}');`);
  };

  const saveFile = () => {
    if (!selectedFile) {
      alert(language === 'ar' ? 'اختر ملفاً أولاً' : 'Select a file first');
      return;
    }
    // في بيئة حقيقية، سنحفظ الملف على الخادم
    alert(language === 'ar' ? `تم حفظ ${selectedFile}` : `Saved ${selectedFile}`);
  };

  return (
    <div className="admin-code-editor" role="main">
      <div className="ace-header">
        <button onClick={() => navigate('/admin-dashboard')} className="ace-back-btn">
          ← {language === 'ar' ? 'العودة' : 'Back'}
        </button>
        <h1 className="ace-title">
          {language === 'ar' ? '💻 محرر الأكواد' : '💻 Code Editor'}
        </h1>
        <button onClick={saveFile} className="ace-save-btn" aria-label={language === 'ar' ? 'حفظ الملف' : 'Save file'}>
          💾 {language === 'ar' ? 'حفظ' : 'Save'}
        </button>
      </div>

      <div className="ace-content">
        {/* File Tree */}
        <div className="ace-file-tree">
          <h2 className="ace-tree-title">
            {language === 'ar' ? '📁 الملفات' : '📁 Files'}
          </h2>
          <div className="ace-tree-list">
            {fileTree.map((file, index) => (
              <button
                key={index}
                onClick={() => loadFile(file.path)}
                className={`ace-file-item ${selectedFile === file.path ? 'active' : ''}`}
              >
                <span>{file.icon}</span>
                <span className="ace-file-path">{file.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="ace-editor-panel">
          {!selectedFile ? (
            <div className="ace-empty-state">
              <p>{language === 'ar' ? 'اختر ملفاً من القائمة' : 'Select a file from the list'}</p>
            </div>
          ) : (
            <>
              <div className="ace-editor-header">
                <span className="ace-current-file">{selectedFile}</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="ace-code-textarea"
                spellCheck="false"
              />
            </>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="ace-warning">
        ⚠️ {language === 'ar' ? 'تحذير: هذا محرر تجريبي. التعديلات المباشرة على الكود قد تسبب مشاكل!' : 
            'Warning: This is a demo editor. Direct code modifications may cause issues!'}
      </div>

      {/* Info */}
      <div className="ace-info">
        <h3>{language === 'ar' ? 'ℹ️ ملاحظة' : 'ℹ️ Note'}</h3>
        <p>
          {language === 'ar' 
            ? 'هذا محرر أكواد تجريبي. في بيئة الإنتاج، يجب استخدام محرر احترافي مثل Monaco Editor أو CodeMirror مع نظام مصادقة قوي وصلاحيات محددة.'
            : 'This is a demo code editor. In production, use a professional editor like Monaco Editor or CodeMirror with strong authentication and permissions.'}
        </p>
      </div>
    </div>
  );
};

export default AdminCodeEditor;
