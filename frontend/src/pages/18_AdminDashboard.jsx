import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslate } from '../hooks/useTranslate';
import adminDashboardTranslations from '../data/adminDashboard.json';
import './18_AdminDashboard.css';

const AdminDashboard = () => {
    const { logout, user, language, token, startBgMusic } = useApp();
    const navigate = useNavigate();
    const t = useTranslate(adminDashboardTranslations);
    
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalCourses: 0,
        totalApplications: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // تشغيل الموسيقى عند فتح الصفحة
    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // جلب الإحصائيات والبيانات
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // استخدام token و user للتحقق من الصلاحيات
    useEffect(() => {
        if (!token || !user) {
            console.log('No token or user, redirecting to login');
            navigate('/login');
        }
    }, [token, user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // هنا يمكن إضافة استدعاءات API لجلب البيانات الحقيقية
            // مؤقتاً نستخدم بيانات تجريبية
            setStats({
                totalUsers: 150,
                totalJobs: 45,
                totalCourses: 28,
                totalApplications: 320
            });
            
            setUsers([
                { id: 1, name: 'أحمد محمد', email: 'ahmad@example.com', type: 'Employee' },
                { id: 2, name: 'شركة التقنية', email: 'tech@example.com', type: 'HR' },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm(t('deleteConfirm'))) {
            // هنا يمكن إضافة استدعاء API لحذف المستخدم
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const renderOverviewTab = () => (
        <div className="admin-tab-content">
            {/* بطاقة الترحيب */}
            <div className="admin-welcome-card">
                <div className="admin-welcome-card-content">
                    <h1 className="admin-welcome-title">
                        {language === 'ar' ? 'مرحباً في لوحة التحكم' : 
                         language === 'fr' ? 'Bienvenue au Tableau de Bord' : 
                         'Welcome to Admin Dashboard'}
                    </h1>
                    <p className="admin-welcome-subtitle">
                        {language === 'ar' ? 'إدارة شاملة لمنصة كاريراك' : 
                         language === 'fr' ? 'Gestion complète de la plateforme Careerak' : 
                         'Complete management of Careerak platform'}
                    </p>
                </div>
                <div className="admin-welcome-bg-element"></div>
            </div>

            {/* الإحصائيات */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-card-title">
                        {language === 'ar' ? 'المستخدمون' : 
                         language === 'fr' ? 'Utilisateurs' : 
                         'Users'}
                    </div>
                    <div className="admin-stat-card-value">{stats.totalUsers}</div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-card-title">
                        {language === 'ar' ? 'الوظائف' : 
                         language === 'fr' ? 'Emplois' : 
                         'Jobs'}
                    </div>
                    <div className="admin-stat-card-value">{stats.totalJobs}</div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-card-title">
                        {language === 'ar' ? 'الدورات' : 
                         language === 'fr' ? 'Cours' : 
                         'Courses'}
                    </div>
                    <div className="admin-stat-card-value">{stats.totalCourses}</div>
                </div>
                
                <div className="admin-stat-card">
                    <div className="admin-stat-card-title">
                        {language === 'ar' ? 'الطلبات' : 
                         language === 'fr' ? 'Candidatures' : 
                         'Applications'}
                    </div>
                    <div className="admin-stat-card-value">{stats.totalApplications}</div>
                </div>
            </div>

            {/* التنقل السريع */}
            <div className="admin-quick-nav-card">
                <div className="admin-quick-nav-header">
                    <span className="admin-quick-nav-icon">⚡</span>
                    <h2 className="admin-quick-nav-title">
                        {language === 'ar' ? 'التنقل السريع' : 
                         language === 'fr' ? 'Navigation Rapide' : 
                         'Quick Navigation'}
                    </h2>
                </div>
                <div className="admin-quick-nav-controls">
                    <button 
                        onClick={() => navigate('/admin/users')}
                        className="admin-quick-nav-btn"
                    >
                        {language === 'ar' ? 'إدارة المستخدمين' : 
                         language === 'fr' ? 'Gérer les Utilisateurs' : 
                         'Manage Users'}
                    </button>
                    <button 
                        onClick={() => navigate('/admin/jobs')}
                        className="admin-quick-nav-btn"
                    >
                        {language === 'ar' ? 'إدارة الوظائف' : 
                         language === 'fr' ? 'Gérer les Emplois' : 
                         'Manage Jobs'}
                    </button>
                    <button 
                        onClick={() => navigate('/admin/courses')}
                        className="admin-quick-nav-btn"
                    >
                        {language === 'ar' ? 'إدارة الدورات' : 
                         language === 'fr' ? 'Gérer les Cours' : 
                         'Manage Courses'}
                    </button>
                    <button 
                        onClick={() => navigate('/admin/settings')}
                        className="admin-quick-nav-btn"
                    >
                        {language === 'ar' ? 'الإعدادات' : 
                         language === 'fr' ? 'Paramètres' : 
                         'Settings'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsersTab = () => (
        <div className="admin-tab-content">
            <div className="admin-users-list">
                {users.map(user => (
                    <div key={user.id} className="admin-user-card">
                        <div>
                            <div className="admin-user-card-name">{user.name}</div>
                            <div className="admin-user-card-details">
                                {user.email} • {user.type}
                            </div>
                        </div>
                        <div className="admin-user-card-actions">
                            <button className="admin-user-card-edit-btn">
                                {language === 'ar' ? 'تعديل' : 
                                 language === 'fr' ? 'Modifier' : 
                                 'Edit'}
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="admin-user-card-delete-btn"
                            >
                                {language === 'ar' ? 'حذف' : 
                                 language === 'fr' ? 'Supprimer' : 
                                 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContentTab = () => (
        <div className="admin-tab-content">
            <div className="admin-content-management-grid">
                <button className="admin-content-management-btn">
                    {language === 'ar' ? '📋 إدارة الوظائف' : 
                     language === 'fr' ? '📋 Gérer les Emplois' : 
                     '📋 Manage Jobs'}
                </button>
                <button className="admin-content-management-btn">
                    {language === 'ar' ? '🎓 إدارة الدورات' : 
                     language === 'fr' ? '🎓 Gérer les Cours' : 
                     '🎓 Manage Courses'}
                </button>
                <button className="admin-content-management-btn">
                    {language === 'ar' ? '📝 إدارة الطلبات' : 
                     language === 'fr' ? '📝 Gérer les Candidatures' : 
                     '📝 Manage Applications'}
                </button>
                <button className="admin-content-management-btn">
                    {language === 'ar' ? '📊 التقارير' : 
                     language === 'fr' ? '📊 Rapports' : 
                     '📊 Reports'}
                </button>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="admin-tab-content">
            <div className="admin-system-settings-list">
                <button className="admin-system-settings-btn">
                    {language === 'ar' ? '⚙️ إعدادات النظام' : 
                     language === 'fr' ? '⚙️ Paramètres Système' : 
                     '⚙️ System Settings'}
                </button>
                <button className="admin-system-settings-btn">
                    {language === 'ar' ? '🔒 الأمان والخصوصية' : 
                     language === 'fr' ? '🔒 Sécurité et Confidentialité' : 
                     '🔒 Security & Privacy'}
                </button>
                <button className="admin-system-settings-btn">
                    {language === 'ar' ? '📧 إعدادات البريد' : 
                     language === 'fr' ? '📧 Paramètres Email' : 
                     '📧 Email Settings'}
                </button>
                <button className="admin-system-settings-btn">
                    {language === 'ar' ? '🔔 إعدادات الإشعارات' : 
                     language === 'fr' ? '🔔 Paramètres Notifications' : 
                     '🔔 Notification Settings'}
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-dashboard-container">
                <div className="text-primary text-xl font-black">
                    {language === 'ar' ? 'جاري التحميل...' : 
                     language === 'fr' ? 'Chargement...' : 
                     'Loading...'}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            {/* الهيدر */}
            <div className="admin-header">
                <div className="admin-header-logo-container">
                    <img 
                        src="/logo.jpg" 
                        alt="Careerak Logo" 
                        className="admin-header-logo"
                    />
                    <div>
                        <div className="admin-header-title">CAREERAK</div>
                        <div className="admin-header-subtitle">
                            {language === 'ar' ? 'لوحة التحكم' : 
                             language === 'fr' ? 'Tableau de Bord' : 
                             'Admin Dashboard'}
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} className="admin-logout-btn">
                    {language === 'ar' ? '🚪 تسجيل الخروج' : 
                     language === 'fr' ? '🚪 Déconnexion' : 
                     '🚪 Logout'}
                </button>
            </div>

            {/* التبويبات */}
            <div className="admin-tabs-container">
                <div className="admin-tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`admin-tab-btn ${
                            activeTab === 'overview' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                    >
                        <span>📊</span>
                        <span>
                            {language === 'ar' ? 'نظرة عامة' : 
                             language === 'fr' ? 'Aperçu' : 
                             'Overview'}
                        </span>
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`admin-tab-btn ${
                            activeTab === 'users' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                    >
                        <span>👥</span>
                        <span>
                            {language === 'ar' ? 'المستخدمون' : 
                             language === 'fr' ? 'Utilisateurs' : 
                             'Users'}
                        </span>
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`admin-tab-btn ${
                            activeTab === 'content' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                    >
                        <span>📝</span>
                        <span>
                            {language === 'ar' ? 'المحتوى' : 
                             language === 'fr' ? 'Contenu' : 
                             'Content'}
                        </span>
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`admin-tab-btn ${
                            activeTab === 'settings' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                    >
                        <span>⚙️</span>
                        <span>
                            {language === 'ar' ? 'الإعدادات' : 
                             language === 'fr' ? 'Paramètres' : 
                             'Settings'}
                        </span>
                    </button>
                </div>
            </div>

            {/* محتوى التبويبات */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'settings' && renderSettingsTab()}
        </div>
    );
};

export default AdminDashboard;
