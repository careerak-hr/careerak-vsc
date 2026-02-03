import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import api from '../services/api';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import './18_AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user, language, token, loading: authLoading, startBgMusic } = useAuth();
  const t = useTranslate();
  const adminT = t.adminDashboard;

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Admin') {
      navigate('/login', { replace: true });
      return;
    }
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [user, authLoading, navigate, startBgMusic]);

  const [selectedPath, setSelectedPath] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, jobs: 0, courses: 0, applications: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadStats();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err) {}
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const deleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/admin/delete-user/${userToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      loadUsers();
    } catch (err) {} finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const appRoutes = [
    { name: "اختيار اللغة (Language)", path: "/language" },
    { name: "صفحة البداية (Entry)", path: "/entry" },
    { name: "تسجيل الدخول (Login)", path: "/login" },
    { name: "إنشاء حساب جديد (Auth)", path: "/auth" },
    { name: "تحقق الرمز (OTP Verify)", path: "/otp-verify" },
    { name: "ترحيب الأفراد (Onboarding Individuals)", path: "/onboarding-individuals" },
    { name: "ترحيب الشركات (Onboarding Companies)", path: "/onboarding-companies" },
    { name: "الأميين (Onboarding Illiterate)", path: "/onboarding-illiterate" },
    { name: "ذوي الهمم - بصري (Onboarding Visual)", path: "/onboarding-visual" },
    { name: "الحالات القصوى (Onboarding Ultimate)", path: "/onboarding-ultimate" },
    { name: "الملف الشخصي (Profile)", path: "/profile" },
    { name: "تصفح الوظائف (Job Postings)", path: "/job-postings" },
    { name: "إضافة وظيفة (Post Job)", path: "/post-job" },
    { name: "تصفح الدورات (Courses)", path: "/courses" },
    { name: "إضافة دورة (Post Course)", path: "/post-course" },
    { name: "سياسة الخصوصية (Policy)", path: "/policy" },
    { name: "الإعدادات (Settings)", path: "/settings" },
    { name: "واجهة الأفراد (Interface Individuals)", path: "/interface-individuals" },
    { name: "واجهة الشركات (Interface Companies)", path: "/interface-companies" },
    { name: "واجهة الأميين (Interface Illiterate)", path: "/interface-illiterate" },
    { name: "واجهة ذوي الهمم البصري (Interface Visual)", path: "/interface-visual" },
    { name: "واجهة المتقدمين (Interface Ultimate)", path: "/interface-ultimate" },
    { name: "واجهة المحلات (Interface Shops)", path: "/interface-shops" },
    { name: "واجهة الورشات (Interface Workshops)", path: "/interface-workshops" },
    { name: "لوحة الأدمن الفرعي (Sub Admin Dashboard)", path: "/admin-sub-dashboard" },
  ];

  const handleQuickNav = () => { if (selectedPath) navigate(selectedPath); };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60] mx-auto mb-4"></div>
          <p className="text-[#304B60] font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container" dir="rtl">
      <div className="admin-header">
        <div className="admin-header-logo-container">
          <img src="./logo.jpg" alt="Logo" className="admin-header-logo" />
          <div>
            <h2 className="admin-header-title">Careerak Admin</h2>
            <p className="admin-header-subtitle">Master Control</p>
          </div>
        </div>
        <button onClick={logout} className="admin-logout-btn">خروج</button>
      </div>

      <div className="admin-tabs-container">
        <div className="admin-tabs">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: '📊' },
            { id: 'users', label: 'إدارة المستخدمين', icon: '👥' },
            { id: 'content', label: 'إدارة المحتوى', icon: '📝' },
            { id: 'system', label: 'إعدادات النظام', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${activeTab === tab.id ? 'admin-tab-btn-active' : 'admin-tab-btn-inactive'}`}>
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-tab-content">
          <div className="admin-welcome-card">
            <div className="admin-welcome-card-content">
              <h3 className="admin-welcome-title">مرحباً، {user?.firstName || 'المدير'}!</h3>
              <p className="admin-welcome-subtitle">لديك كامل الصلاحيات لإدارة نظام كاريرك.</p>
            </div>
            <div className="admin-welcome-bg-element"></div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <p className="admin-stat-card-title">المستخدمين</p>
              <span className="admin-stat-card-value">{stats.users}</span>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card-title">الوظائف</p>
              <span className="admin-stat-card-value">{stats.jobs}</span>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card-title">الدورات</p>
              <span className="admin-stat-card-value">{stats.courses}</span>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card-title">الطلبات</p>
              <span className="admin-stat-card-value">{stats.applications}</span>
            </div>
          </div>

          <div className="admin-quick-nav-card">
            <div className="admin-quick-nav-header">
              <span className="admin-quick-nav-icon">🚀</span>
              <h4 className="admin-quick-nav-title">التنقل السريع</h4>
            </div>
            <div className="admin-quick-nav-controls">
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                className="admin-quick-nav-select">
                <option value="" disabled>-- اختر الصفحة --</option>
                {appRoutes.map((route, idx) => (
                  <option key={idx} value={route.path}>{route.name}</option>
                ))}
              </select>
              <button onClick={handleQuickNav} disabled={!selectedPath} className="admin-quick-nav-btn">
                انتقال فوري
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="w-full max-w-6xl">
          <div className="admin-quick-nav-card">
            <h3 className="admin-quick-nav-title mb-6">إدارة المستخدمين</h3>
            {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
              <div className="admin-users-list">
                {users.map(u => (
                  <div key={u._id} className="admin-user-card">
                    <div>
                      <p className="admin-user-card-name">{u.firstName} {u.lastName}</p>
                      <p className="admin-user-card-details">{u.email} - {u.role}</p>
                    </div>
                    <div className="admin-user-card-actions">
                      <button className="admin-user-card-edit-btn">تعديل</button>
                      <button onClick={() => deleteUser(u._id)} className="admin-user-card-delete-btn">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="w-full max-w-6xl">
          <div className="admin-quick-nav-card">
            <h3 className="admin-quick-nav-title mb-6">إدارة المحتوى</h3>
            <div className="admin-content-management-grid">
              <button onClick={() => navigate('/post-job')} className="admin-content-management-btn">إدارة الوظائف</button>
              <button onClick={() => navigate('/post-course')} className="admin-content-management-btn">إدارة الدورات</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="w-full max-w-6xl">
          <div className="admin-quick-nav-card">
            <h3 className="admin-quick-nav-title mb-6">إعدادات النظام</h3>
            <div className="admin-system-settings-list">
              <button className="admin-system-settings-btn">إدارة قاعدة البيانات</button>
              <button className="admin-system-settings-btn">سجلات الأخطاء</button>
              <button className="admin-system-settings-btn">النسخ الاحتياطي</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        message={adminT.deleteConfirm}
        confirmText={adminT.confirm}
        cancelText={adminT.cancel}
        language={language}
      />
    </div>
  );
}