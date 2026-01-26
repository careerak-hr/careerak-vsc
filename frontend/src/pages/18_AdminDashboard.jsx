import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import adminDashboardTranslations from '../data/adminDashboard.json';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user, language, token } = useAuth();
  const t = adminDashboardTranslations[language] || adminDashboardTranslations.ar;

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'Admin') {
      console.log('User is not admin, redirecting to profile:', user.role);
      navigate('/profile', { replace: true });
      return;
    }
    console.log('Admin access granted for user:', user);
  }, [user, navigate]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/admin/delete-user/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
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

  return (
    <div className="min-h-screen bg-[#E3DAD1] p-6 flex flex-col items-center select-none font-sans" dir="rtl">
      {/* Header */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-8 bg-[#304B60]/5 p-4 rounded-3xl border border-[#D48161]/10 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#304B60]" />
          <div>
            <h2 className="text-[#304B60] font-black text-lg italic">Careerak Admin</h2>
            <p className="text-[10px] text-[#304B60]/60 font-bold uppercase tracking-wider">Master Control</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">خروج</button>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex gap-2 bg-[#304B60]/5 p-2 rounded-2xl">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: '📊' },
            { id: 'users', label: 'إدارة المستخدمين', icon: '👥' },
            { id: 'content', label: 'إدارة المحتوى', icon: '📝' },
            { id: 'system', label: 'إعدادات النظام', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'bg-[#304B60] text-[#D48161] shadow-md' : 'text-[#304B60]/60'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="w-full max-w-6xl space-y-8">
          {/* Welcome Card */}
          <div className="w-full bg-[#304B60] text-[#E3DAD1] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-2">مرحباً، {user?.firstName || 'المدير'}!</h3>
              <p className="text-[#E3DAD1]/60 font-bold text-sm">لديك كامل الصلاحيات لإدارة نظام كاريرك.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D48161]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
              <p className="text-[#304B60]/40 font-black text-sm mb-2 uppercase">المستخدمين</p>
              <span className="text-[#304B60] font-black text-3xl">{stats.users}</span>
            </div>
            <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
              <p className="text-[#304B60]/40 font-black text-sm mb-2 uppercase">الوظائف</p>
              <span className="text-[#304B60] font-black text-3xl">{stats.jobs}</span>
            </div>
            <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
              <p className="text-[#304B60]/40 font-black text-sm mb-2 uppercase">الدورات</p>
              <span className="text-[#304B60] font-black text-3xl">{stats.courses}</span>
            </div>
            <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
              <p className="text-[#304B60]/40 font-black text-sm mb-2 uppercase">الطلبات</p>
              <span className="text-[#304B60] font-black text-3xl">{stats.applications}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-[#304B60]/5 p-8 rounded-[3rem] shadow-xl border border-[#D48161]/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🚀</span>
              <h4 className="text-[#304B60] font-black text-xl">التنقل السريع</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                className="w-full p-4 bg-[#E3DAD1] text-[#304B60] rounded-2xl border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-sm"
              >
                <option value="" disabled>-- اختر الصفحة --</option>
                {appRoutes.map((route, idx) => (
                  <option key={idx} value={route.path}>{route.name}</option>
                ))}
              </select>
              <button
                onClick={handleQuickNav}
                disabled={!selectedPath}
                className="py-4 bg-[#304B60] text-[#D48161] rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-30"
              >
                انتقال فوري
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="w-full max-w-6xl">
          <div className="bg-[#304B60]/5 p-8 rounded-[3rem] shadow-xl border border-[#D48161]/10">
            <h3 className="text-[#304B60] font-black text-2xl mb-6">إدارة المستخدمين</h3>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <div className="space-y-4">
                {users.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-4 bg-[#E3DAD1] rounded-2xl">
                    <div>
                      <p className="font-black text-[#304B60]">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-[#304B60]/60">{u.email} - {u.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#304B60] text-[#D48161] rounded-xl font-black text-sm">تعديل</button>
                      <button onClick={() => deleteUser(u._id)} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-sm">حذف</button>
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
          <div className="bg-[#304B60]/5 p-8 rounded-[3rem] shadow-xl border border-[#D48161]/10">
            <h3 className="text-[#304B60] font-black text-2xl mb-6">إدارة المحتوى</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => navigate('/post-job')} className="p-6 bg-[#E3DAD1] rounded-2xl text-[#304B60] font-black text-lg hover:bg-[#304B60] hover:text-[#D48161] transition-all">
                إدارة الوظائف
              </button>
              <button onClick={() => navigate('/post-course')} className="p-6 bg-[#E3DAD1] rounded-2xl text-[#304B60] font-black text-lg hover:bg-[#304B60] hover:text-[#D48161] transition-all">
                إدارة الدورات
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="w-full max-w-6xl">
          <div className="bg-[#304B60]/5 p-8 rounded-[3rem] shadow-xl border border-[#D48161]/10">
            <h3 className="text-[#304B60] font-black text-2xl mb-6">إعدادات النظام</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-[#E3DAD1] rounded-2xl text-[#304B60] font-black text-lg hover:bg-[#304B60] hover:text-[#D48161] transition-all">
                إدارة قاعدة البيانات
              </button>
              <button className="w-full p-4 bg-[#E3DAD1] rounded-2xl text-[#304B60] font-black text-lg hover:bg-[#304B60] hover:text-[#D48161] transition-all">
                سجلات الأخطاء
              </button>
              <button className="w-full p-4 bg-[#E3DAD1] rounded-2xl text-[#304B60] font-black text-lg hover:bg-[#304B60] hover:text-[#D48161] transition-all">
                النسخ الاحتياطي
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        message={t.deleteConfirm}
        confirmText={t.confirm}
        cancelText={t.cancel}
        language={language}
      />
    </div>
  );
}
