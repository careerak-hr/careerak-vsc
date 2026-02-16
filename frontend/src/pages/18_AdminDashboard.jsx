import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';
import adminDashboardTranslations from '../data/adminDashboard.json';
import api from '../services/api';
import './18_AdminDashboard.css';

const AdminDashboard = () => {
    const { logout, user, language, token, startBgMusic } = useApp();
    const navigate = useNavigate();
    const t = adminDashboardTranslations[language] || adminDashboardTranslations.ar;
    
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalCourses: 0,
        totalApplications: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // تشغيل الموسيقى عند فتح الصفحة
    useEffect(() => {
        if (startBgMusic) startBgMusic();
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
        if (user && user.role !== 'Admin') {
            console.log('User is not admin, redirecting');
            navigate('/');
        }
    }, [token, user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(''); // مسح أي خطأ سابق
            
            // جلب الإحصائيات من API
            const statsResponse = await api.get('/admin/stats');
            setStats({
                totalUsers: statsResponse.data.users || 0,
                totalJobs: statsResponse.data.jobs || 0,
                totalCourses: statsResponse.data.courses || 0,
                totalApplications: statsResponse.data.applications || 0
            });
            
            // جلب المستخدمين
            const usersResponse = await api.get('/admin/users');
            setUsers(usersResponse.data || []);
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // عرض رسالة الخطأ فقط إذا كان هناك خطأ في الاتصال
            if (error.response?.status >= 500 || error.message === 'Network Error') {
                setError(error.response?.data?.error || 'فشل تحميل البيانات');
            }
            
            // في حالة الفشل، استخدم بيانات افتراضية بدون عرض خطأ
            setStats({
                totalUsers: 0,
                totalJobs: 0,
                totalCourses: 0,
                totalApplications: 0
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = async (userId) => {
        const confirmText = language === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' :
                           language === 'fr' ? 'Êtes-vous sûr de supprimer cet utilisateur?' :
                           'Are you sure you want to delete this user?';
        
        if (window.confirm(confirmText)) {
            try {
                await api.delete(`/admin/delete-user/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
                
                const successText = language === 'ar' ? 'تم حذف المستخدم بنجاح' :
                                   language === 'fr' ? 'Utilisateur supprimé avec succès' :
                                   'User deleted successfully';
                alert(successText);
                
                // تحديث الإحصائيات
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting user:', error);
                const errorText = language === 'ar' ? 'فشل حذف المستخدم' :
                                 language === 'fr' ? 'Échec de la suppression' :
                                 'Failed to delete user';
                alert(errorText);
            }
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

            {error && (
                <div className="admin-error-message">
                    <p className="text-danger font-black">{error}</p>
                </div>
            )}

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
                <div className="admin-quick-nav-grid">
                    <button 
                        onClick={() => navigate('/admin-pages')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'متصفح الصفحات' : 
                                   language === 'fr' ? 'Navigateur' : 
                                   'Pages'}
                    >
                        <span className="orb-icon">🗺️</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'المستخدمين' : 
                                   language === 'fr' ? 'Utilisateurs' : 
                                   'Users'}
                    >
                        <span className="orb-icon">👥</span>
                    </button>
                    <button 
                        onClick={() => navigate('/job-postings')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'الوظائف' : 
                                   language === 'fr' ? 'Emplois' : 
                                   'Jobs'}
                    >
                        <span className="orb-icon">💼</span>
                    </button>
                    <button 
                        onClick={() => navigate('/courses')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'الدورات' : 
                                   language === 'fr' ? 'Cours' : 
                                   'Courses'}
                    >
                        <span className="orb-icon">🎓</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-system')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'النظام' : 
                                   language === 'fr' ? 'Système' : 
                                   'System'}
                    >
                        <span className="orb-icon">🖥️</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-database')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'قاعدة البيانات' : 
                                   language === 'fr' ? 'Base de Données' : 
                                   'Database'}
                    >
                        <span className="orb-icon">🗄️</span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-code-editor')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'الأكواد' : 
                                   language === 'fr' ? 'Code' : 
                                   'Code'}
                    >
                        <span className="orb-icon">💻</span>
                    </button>
                    <button 
                        onClick={() => navigate('/settings')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'الإعدادات' : 
                                   language === 'fr' ? 'Paramètres' : 
                                   'Settings'}
                    >
                        <span className="orb-icon">⚙️</span>
                    </button>
                    <button 
                        onClick={() => navigate('/post-job')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'إضافة وظيفة' : 
                                   language === 'fr' ? 'Ajouter Emploi' : 
                                   'Add Job'}
                    >
                        <span className="orb-icon">➕</span>
                    </button>
                    <button 
                        onClick={() => navigate('/post-course')}
                        className="admin-quick-nav-orb"
                        data-label={language === 'ar' ? 'إضافة دورة' : 
                                   language === 'fr' ? 'Ajouter Cours' : 
                                   'Add Course'}
                    >
                        <span className="orb-icon">📚</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsersTab = () => (
        <div className="admin-tab-content">
            <div className="admin-users-header">
                <h2 className="admin-users-title">
                    {language === 'ar' ? 'إدارة المستخدمين' : 
                     language === 'fr' ? 'Gestion des Utilisateurs' : 
                     'User Management'}
                </h2>
                <button 
                    onClick={fetchDashboardData}
                    className="admin-refresh-btn"
                >
                    🔄 {language === 'ar' ? 'تحديث' : 
                        language === 'fr' ? 'Actualiser' : 
                        'Refresh'}
                </button>
            </div>
            
            {users.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="text-primary/60 font-black">
                        {language === 'ar' ? 'لا يوجد مستخدمون' : 
                         language === 'fr' ? 'Aucun utilisateur' : 
                         'No users found'}
                    </p>
                </div>
            ) : (
                <div className="admin-users-list">
                    {users.map(user => (
                        <div key={user._id} className="admin-user-card">
                            <div>
                                <div className="admin-user-card-name">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="admin-user-card-details">
                                    {user.email} • {user.role}
                                </div>
                                {user.phone && (
                                    <div className="admin-user-card-phone">
                                        📞 {user.phone}
                                    </div>
                                )}
                            </div>
                            <div className="admin-user-card-actions">
                                <button 
                                    onClick={() => navigate(`/profile`, { state: { userId: user._id } })}
                                    className="admin-user-card-view-btn"
                                >
                                    👁️ {language === 'ar' ? 'عرض' : 
                                        language === 'fr' ? 'Voir' : 
                                        'View'}
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="admin-user-card-delete-btn"
                                    disabled={user.role === 'Admin'}
                                >
                                    🗑️ {language === 'ar' ? 'حذف' : 
                                        language === 'fr' ? 'Supprimer' : 
                                        'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderContentTab = () => (
        <div className="admin-tab-content">
            <h2 className="admin-section-title">
                {language === 'ar' ? 'إدارة المحتوى' : 
                 language === 'fr' ? 'Gestion du Contenu' : 
                 'Content Management'}
            </h2>
            <div className="admin-content-management-grid">
                <button 
                    onClick={() => navigate('/job-postings')}
                    className="admin-content-management-btn"
                >
                    📋 {language === 'ar' ? 'إدارة الوظائف' : 
                        language === 'fr' ? 'Gérer les Emplois' : 
                        'Manage Jobs'}
                    <span className="admin-content-count">{stats.totalJobs}</span>
                </button>
                <button 
                    onClick={() => navigate('/courses')}
                    className="admin-content-management-btn"
                >
                    🎓 {language === 'ar' ? 'إدارة الدورات' : 
                        language === 'fr' ? 'Gérer les Cours' : 
                        'Manage Courses'}
                    <span className="admin-content-count">{stats.totalCourses}</span>
                </button>
                <button 
                    onClick={() => navigate('/post-job')}
                    className="admin-content-management-btn"
                >
                    ➕ {language === 'ar' ? 'إضافة وظيفة جديدة' : 
                        language === 'fr' ? 'Ajouter un Emploi' : 
                        'Add New Job'}
                </button>
                <button 
                    onClick={() => navigate('/post-course')}
                    className="admin-content-management-btn"
                >
                    ➕ {language === 'ar' ? 'إضافة دورة جديدة' : 
                        language === 'fr' ? 'Ajouter un Cours' : 
                        'Add New Course'}
                </button>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="admin-tab-content">
            <h2 className="admin-section-title">
                {language === 'ar' ? 'إعدادات النظام' : 
                 language === 'fr' ? 'Paramètres Système' : 
                 'System Settings'}
            </h2>
            <div className="admin-system-settings-list">
                <button 
                    onClick={() => navigate('/settings')}
                    className="admin-system-settings-btn"
                >
                    ⚙️ {language === 'ar' ? 'إعدادات التطبيق' : 
                        language === 'fr' ? 'Paramètres Application' : 
                        'App Settings'}
                </button>
                <button 
                    onClick={() => navigate('/policy')}
                    className="admin-system-settings-btn"
                >
                    🔒 {language === 'ar' ? 'سياسة الخصوصية' : 
                        language === 'fr' ? 'Politique de Confidentialité' : 
                        'Privacy Policy'}
                </button>
                <button 
                    onClick={() => setActiveTab('overview')}
                    className="admin-system-settings-btn"
                >
                    📊 {language === 'ar' ? 'الإحصائيات' : 
                        language === 'fr' ? 'Statistiques' : 
                        'Statistics'}
                </button>
                <button 
                    onClick={fetchDashboardData}
                    className="admin-system-settings-btn"
                >
                    🔄 {language === 'ar' ? 'تحديث البيانات' : 
                        language === 'fr' ? 'Actualiser les Données' : 
                        'Refresh Data'}
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-dashboard-container">
                <div className="admin-loading">
                    <div className="admin-loading-spinner"></div>
                    <p className="text-primary text-xl font-black mt-4">
                        {language === 'ar' ? 'جاري التحميل...' : 
                         language === 'fr' ? 'Chargement...' : 
                         'Loading...'}
                    </p>
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
                <div className="admin-header-actions">
                    <button 
                        onClick={() => navigate('/settings')} 
                        className="admin-settings-btn"
                        title={language === 'ar' ? 'الإعدادات' : 
                               language === 'fr' ? 'Paramètres' : 
                               'Settings'}
                    >
                        ⚙️
                    </button>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        🚪 {language === 'ar' ? 'تسجيل الخروج' : 
                            language === 'fr' ? 'Déconnexion' : 
                            'Logout'}
                    </button>
                </div>
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
