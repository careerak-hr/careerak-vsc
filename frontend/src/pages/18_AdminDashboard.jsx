import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import adminDashboardTranslations from '../data/adminDashboard.json';
import api from '../services/api';
import InteractiveElement from '../components/InteractiveElement';
import Spinner from '../components/Loading/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import ToastNotification from '../components/ToastNotification';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import useToast from '../hooks/useToast';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import './18_AdminDashboard.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const AdminDashboard = () => {
    const { logout, user, language, token, startBgMusic } = useApp();
    const navigate = useNavigate();
    const t = adminDashboardTranslations[language] || adminDashboardTranslations.ar;
    const seo = useSEO('adminDashboard');
    const { toast, showToast, hideToast } = useToast();
    
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
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);

    // Define keyboard shortcuts
    const shortcuts = [
        // Navigation
        { keys: '1', description: language === 'ar' ? 'نظرة عامة' : language === 'fr' ? 'Aperçu' : 'Overview', category: 'navigation' },
        { keys: '2', description: language === 'ar' ? 'المستخدمون' : language === 'fr' ? 'Utilisateurs' : 'Users', category: 'navigation' },
        { keys: '3', description: language === 'ar' ? 'المحتوى' : language === 'fr' ? 'Contenu' : 'Content', category: 'navigation' },
        { keys: '4', description: language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings', category: 'navigation' },
        
        // Actions
        { keys: 'Ctrl+R', description: language === 'ar' ? 'تحديث البيانات' : language === 'fr' ? 'Actualiser' : 'Refresh Data', category: 'actions' },
        { keys: 'Ctrl+S', description: language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings', category: 'actions' },
        { keys: 'Ctrl+L', description: language === 'ar' ? 'تسجيل الخروج' : language === 'fr' ? 'Déconnexion' : 'Logout', category: 'actions' },
        
        // General
        { keys: '?', description: language === 'ar' ? 'عرض الاختصارات' : language === 'fr' ? 'Afficher les raccourcis' : 'Show Shortcuts', category: 'general' },
        { keys: 'Esc', description: language === 'ar' ? 'إغلاق النافذة' : language === 'fr' ? 'Fermer' : 'Close Modal', category: 'general' }
    ];

    // Keyboard shortcuts handlers
    useKeyboardShortcuts({
        '1': () => setActiveTab('overview'),
        '2': () => setActiveTab('users'),
        '3': () => setActiveTab('content'),
        '4': () => setActiveTab('settings'),
        'ctrl+r': (e) => {
            e.preventDefault();
            fetchDashboardData();
            showToast(
                language === 'ar' ? 'جاري تحديث البيانات...' :
                language === 'fr' ? 'Actualisation des données...' :
                'Refreshing data...',
                'info'
            );
        },
        'ctrl+s': (e) => {
            e.preventDefault();
            navigate('/settings');
        },
        'ctrl+l': (e) => {
            e.preventDefault();
            handleLogout();
        },
        '?': () => setShowShortcutsModal(true),
        'escape': () => setShowShortcutsModal(false)
    }, !loading); // Disable shortcuts while loading

    // Tab navigation order
    const tabs = ['overview', 'users', 'content', 'settings'];

    // Keyboard navigation for tabs
    const handleTabKeyDown = (e) => {
        const currentIndex = tabs.indexOf(activeTab);
        let newIndex = currentIndex;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = tabs.length - 1;
        }

        if (newIndex !== currentIndex) {
            setActiveTab(tabs[newIndex]);
            // Focus the new tab
            setTimeout(() => {
                document.getElementById(`${tabs[newIndex]}-tab`)?.focus();
            }, 0);
        }
    };

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
            setError(error.response?.data?.error || 'فشل تحميل البيانات');
            
            // في حالة الفشل، استخدم بيانات افتراضية
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
                showToast(successText, 'success');
                
                // تحديث الإحصائيات
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting user:', error);
                const errorText = language === 'ar' ? 'فشل حذف المستخدم' :
                                 language === 'fr' ? 'Échec de la suppression' :
                                 'Failed to delete user';
                showToast(errorText, 'error');
            }
        }
    };

    const renderOverviewTab = () => (
        <div className="admin-tab-content" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
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
                <ErrorMessage 
                    message={error}
                    variant="errorSlide"
                    className="mb-6"
                />
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
                
                {/* قائمة منسدلة للتنقل بين صفحات التطبيق */}
                <div className="admin-pages-dropdown-container">
                    <label className="admin-pages-dropdown-label">
                        {language === 'ar' ? 'الانتقال إلى صفحة:' : 
                         language === 'fr' ? 'Aller à la page:' : 
                         'Go to page:'}
                    </label>
                    <select 
                        className="admin-pages-dropdown"
                        onChange={(e) => {
                            if (e.target.value) {
                                navigate(e.target.value + '?preview=true');
                                e.target.value = ''; // إعادة تعيين القيمة
                            }
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            {language === 'ar' ? 'اختر صفحة...' : 
                             language === 'fr' ? 'Choisir une page...' : 
                             'Select a page...'}
                        </option>
                        
                        {/* الصفحات العامة */}
                        <option value="/entry">
                            {language === 'ar' ? '🏠 الصفحة الرئيسية' : 
                             language === 'fr' ? '🏠 Page d\'accueil' : 
                             '🏠 Home Page'}
                        </option>
                        <option value="/language">
                            {language === 'ar' ? '🌐 اختيار اللغة' : 
                             language === 'fr' ? '🌐 Choix de langue' : 
                             '🌐 Language Selection'}
                        </option>
                        <option value="/login">
                            {language === 'ar' ? '🔐 تسجيل الدخول' : 
                             language === 'fr' ? '🔐 Connexion' : 
                             '🔐 Login'}
                        </option>
                        <option value="/auth">
                            {language === 'ar' ? '📝 التسجيل' : 
                             language === 'fr' ? '📝 Inscription' : 
                             '📝 Registration'}
                        </option>
                        <option value="/otp-verify">
                            {language === 'ar' ? '🔢 التحقق من OTP' : 
                             language === 'fr' ? '🔢 Vérification OTP' : 
                             '🔢 OTP Verification'}
                        </option>
                        
                        {/* صفحات التهيئة */}
                        <option value="/onboarding-individuals">
                            {language === 'ar' ? '🚀 تهيئة الأفراد' : 
                             language === 'fr' ? '🚀 Intégration Individus' : 
                             '🚀 Individuals Onboarding'}
                        </option>
                        <option value="/onboarding-companies">
                            {language === 'ar' ? '🚀 تهيئة الشركات' : 
                             language === 'fr' ? '🚀 Intégration Entreprises' : 
                             '🚀 Companies Onboarding'}
                        </option>
                        <option value="/onboarding-illiterate">
                            {language === 'ar' ? '🚀 تهيئة الأميين' : 
                             language === 'fr' ? '🚀 Intégration Analphabètes' : 
                             '🚀 Illiterate Onboarding'}
                        </option>
                        <option value="/onboarding-visual">
                            {language === 'ar' ? '🚀 تهيئة المكفوفين' : 
                             language === 'fr' ? '🚀 Intégration Malvoyants' : 
                             '🚀 Visual Onboarding'}
                        </option>
                        <option value="/onboarding-ultimate">
                            {language === 'ar' ? '🚀 التهيئة المتقدمة' : 
                             language === 'fr' ? '🚀 Intégration Ultime' : 
                             '🚀 Ultimate Onboarding'}
                        </option>
                        
                        {/* الواجهات */}
                        <option value="/interface-individuals">
                            {language === 'ar' ? '👤 واجهة الأفراد' : 
                             language === 'fr' ? '👤 Interface Individus' : 
                             '👤 Individuals Interface'}
                        </option>
                        <option value="/interface-companies">
                            {language === 'ar' ? '🏢 واجهة الشركات' : 
                             language === 'fr' ? '🏢 Interface Entreprises' : 
                             '🏢 Companies Interface'}
                        </option>
                        <option value="/interface-illiterate">
                            {language === 'ar' ? '📖 واجهة الأميين' : 
                             language === 'fr' ? '📖 Interface Analphabètes' : 
                             '📖 Illiterate Interface'}
                        </option>
                        <option value="/interface-visual">
                            {language === 'ar' ? '👁️ واجهة المكفوفين' : 
                             language === 'fr' ? '👁️ Interface Malvoyants' : 
                             '👁️ Visual Interface'}
                        </option>
                        <option value="/interface-ultimate">
                            {language === 'ar' ? '⭐ الواجهة المتقدمة' : 
                             language === 'fr' ? '⭐ Interface Ultime' : 
                             '⭐ Ultimate Interface'}
                        </option>
                        <option value="/interface-shops">
                            {language === 'ar' ? '🛍️ واجهة المتاجر' : 
                             language === 'fr' ? '🛍️ Interface Boutiques' : 
                             '🛍️ Shops Interface'}
                        </option>
                        <option value="/interface-workshops">
                            {language === 'ar' ? '🔧 واجهة الورش' : 
                             language === 'fr' ? '🔧 Interface Ateliers' : 
                             '🔧 Workshops Interface'}
                        </option>
                        
                        {/* الوظائف والدورات */}
                        <option value="/job-postings">
                            {language === 'ar' ? '💼 الوظائف' : 
                             language === 'fr' ? '💼 Emplois' : 
                             '💼 Job Postings'}
                        </option>
                        <option value="/post-job">
                            {language === 'ar' ? '➕ نشر وظيفة' : 
                             language === 'fr' ? '➕ Publier Emploi' : 
                             '➕ Post Job'}
                        </option>
                        <option value="/courses">
                            {language === 'ar' ? '🎓 الدورات' : 
                             language === 'fr' ? '🎓 Cours' : 
                             '🎓 Courses'}
                        </option>
                        <option value="/post-course">
                            {language === 'ar' ? '➕ نشر دورة' : 
                             language === 'fr' ? '➕ Publier Cours' : 
                             '➕ Post Course'}
                        </option>
                        
                        {/* الإعدادات والملف الشخصي */}
                        <option value="/profile">
                            {language === 'ar' ? '👤 الملف الشخصي' : 
                             language === 'fr' ? '👤 Profil' : 
                             '👤 Profile'}
                        </option>
                        <option value="/settings">
                            {language === 'ar' ? '⚙️ الإعدادات' : 
                             language === 'fr' ? '⚙️ Paramètres' : 
                             '⚙️ Settings'}
                        </option>
                        <option value="/policy">
                            {language === 'ar' ? '🔒 سياسة الخصوصية' : 
                             language === 'fr' ? '🔒 Politique de Confidentialité' : 
                             '🔒 Privacy Policy'}
                        </option>
                        
                        {/* صفحات الأدمن */}
                        <option value="/admin-dashboard">
                            {language === 'ar' ? '📊 لوحة التحكم الرئيسية' : 
                             language === 'fr' ? '📊 Tableau de Bord Principal' : 
                             '📊 Main Dashboard'}
                        </option>
                        <option value="/admin-sub-dashboard">
                            {language === 'ar' ? '📈 لوحة التحكم الفرعية' : 
                             language === 'fr' ? '📈 Sous-Tableau de Bord' : 
                             '📈 Sub Dashboard'}
                        </option>
                        <option value="/admin-pages">
                            {language === 'ar' ? '📄 متصفح الصفحات' : 
                             language === 'fr' ? '📄 Navigateur de Pages' : 
                             '📄 Pages Navigator'}
                        </option>
                        <option value="/admin-system">
                            {language === 'ar' ? '🖥️ التحكم بالنظام' : 
                             language === 'fr' ? '🖥️ Contrôle Système' : 
                             '🖥️ System Control'}
                        </option>
                        <option value="/admin-database">
                            {language === 'ar' ? '🗄️ إدارة قاعدة البيانات' : 
                             language === 'fr' ? '🗄️ Gestion Base de Données' : 
                             '🗄️ Database Manager'}
                        </option>
                        <option value="/admin-code-editor">
                            {language === 'ar' ? '💻 محرر الأكواد' : 
                             language === 'fr' ? '💻 Éditeur de Code' : 
                             '💻 Code Editor'}
                        </option>
                    </select>
                </div>

                {/* شبكة الأيقونات العادية */}
                <div className="admin-quick-nav-simple-grid">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">👥</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'المستخدمين' : 
                             language === 'fr' ? 'Utilisateurs' : 
                             'Users'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/job-postings')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">💼</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'الوظائف' : 
                             language === 'fr' ? 'Emplois' : 
                             'Jobs'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/courses')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">🎓</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'الدورات' : 
                             language === 'fr' ? 'Cours' : 
                             'Courses'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-system')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">🖥️</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'النظام' : 
                             language === 'fr' ? 'Système' : 
                             'System'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-database')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">🗄️</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'قاعدة البيانات' : 
                             language === 'fr' ? 'Base de Données' : 
                             'Database'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/admin-code-editor')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">💻</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'الأكواد' : 
                             language === 'fr' ? 'Code' : 
                             'Code'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/settings')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">⚙️</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'الإعدادات' : 
                             language === 'fr' ? 'Paramètres' : 
                             'Settings'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/post-job')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">➕</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'إضافة وظيفة' : 
                             language === 'fr' ? 'Ajouter Emploi' : 
                             'Add Job'}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/post-course')}
                        className="admin-quick-nav-simple-btn"
                    >
                        <span className="simple-btn-icon">📚</span>
                        <span className="simple-btn-label">
                            {language === 'ar' ? 'إضافة دورة' : 
                             language === 'fr' ? 'Ajouter Cours' : 
                             'Add Course'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsersTab = () => (
        <div className="admin-tab-content" role="tabpanel" id="users-panel" aria-labelledby="users-tab">
            <div className="admin-users-header">
                <h2 className="admin-users-title">
                    {language === 'ar' ? 'إدارة المستخدمين' : 
                     language === 'fr' ? 'Gestion des Utilisateurs' : 
                     'User Management'}
                </h2>
                <button 
                    onClick={fetchDashboardData}
                    className="admin-refresh-btn"
                    aria-label={language === 'ar' ? 'تحديث البيانات' : 
                        language === 'fr' ? 'Actualiser les données' : 
                        'Refresh data'}
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
                                    aria-label={language === 'ar' ? 'حذف المستخدم' : 
                                        language === 'fr' ? 'Supprimer l\'utilisateur' : 
                                        'Delete user'}
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
        <div className="admin-tab-content" role="tabpanel" id="content-panel" aria-labelledby="content-tab">
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
        <div className="admin-tab-content" role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
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
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="admin-dashboard-container">
                    <div className="admin-loading">
                        <Spinner size="large" color="primary" ariaLabel={
                            language === 'ar' ? 'جاري التحميل...' : 
                            language === 'fr' ? 'Chargement...' : 
                            'Loading...'
                        } />
                        <p className="text-primary text-xl font-black mt-4">
                            {language === 'ar' ? 'جاري التحميل...' : 
                             language === 'fr' ? 'Chargement...' : 
                             'Loading...'}
                        </p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1" className="admin-dashboard-container">
            {/* Toast Notification */}
            {toast && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={hideToast}
                    position="top-right"
                />
            )}

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal
                isOpen={showShortcutsModal}
                onClose={() => setShowShortcutsModal(false)}
                shortcuts={shortcuts}
                language={language}
            />
            
            {/* الهيدر */}
            <header className="admin-header">
                <div className="admin-header-logo-container">
                    <img 
                        src="/logo.jpg" 
                        alt="Careerak logo - Admin dashboard control panel" 
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
                        onClick={() => setShowShortcutsModal(true)}
                        className="admin-settings-btn"
                        title={language === 'ar' ? 'اختصارات لوحة المفاتيح (?)' : 
                               language === 'fr' ? 'Raccourcis clavier (?)' : 
                               'Keyboard Shortcuts (?)'}
                    >
                        ⌨️
                    </button>
                    <button 
                        onClick={() => navigate('/settings')} 
                        className="admin-settings-btn"
                        title={language === 'ar' ? 'الإعدادات' : 
                               language === 'fr' ? 'Paramètres' : 
                               'Settings'}
                    >
                        ⚙️
                    </button>
                    <button onClick={handleLogout} className="admin-logout-btn" aria-label={language === 'ar' ? 'تسجيل الخروج' : 
                            language === 'fr' ? 'Déconnexion' : 
                            'Logout'}>
                        🚪 {language === 'ar' ? 'تسجيل الخروج' : 
                            language === 'fr' ? 'Déconnexion' : 
                            'Logout'}
                    </button>
                </div>
            </header>

            {/* التبويبات */}
            <nav className="admin-tabs-container" role="navigation" aria-label="Admin sections">
                <div className="admin-tabs" role="tablist">
                    <button
                        onClick={() => setActiveTab('overview')}
                        onKeyDown={handleTabKeyDown}
                        className={`admin-tab-btn ${
                            activeTab === 'overview' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'overview'}
                        aria-controls="overview-panel"
                        id="overview-tab"
                        tabIndex={activeTab === 'overview' ? 0 : -1}
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
                        onKeyDown={handleTabKeyDown}
                        className={`admin-tab-btn ${
                            activeTab === 'users' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'users'}
                        aria-controls="users-panel"
                        id="users-tab"
                        tabIndex={activeTab === 'users' ? 0 : -1}
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
                        onKeyDown={handleTabKeyDown}
                        className={`admin-tab-btn ${
                            activeTab === 'content' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'content'}
                        aria-controls="content-panel"
                        id="content-tab"
                        tabIndex={activeTab === 'content' ? 0 : -1}
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
                        onKeyDown={handleTabKeyDown}
                        className={`admin-tab-btn ${
                            activeTab === 'settings' 
                                ? 'admin-tab-btn-active' 
                                : 'admin-tab-btn-inactive'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'settings'}
                        aria-controls="settings-panel"
                        id="settings-tab"
                        tabIndex={activeTab === 'settings' ? 0 : -1}
                    >
                        <span>⚙️</span>
                        <span>
                            {language === 'ar' ? 'الإعدادات' : 
                             language === 'fr' ? 'Paramètres' : 
                             'Settings'}
                        </span>
                    </button>
                </div>
            </nav>

            {/* محتوى التبويبات */}
            <div className="admin-tabs-content">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            </div>
        </main>
        </>
    );
};

export default AdminDashboard;
