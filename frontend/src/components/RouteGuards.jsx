import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlobalLoader } from './GlobalLoaders';

/**
 * مكون حماية المسارات - يتطلب تسجيل الدخول
 * Protected Route Component - Requires Authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    // حفظ المسار المطلوب للعودة إليه بعد تسجيل الدخول
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * مكون حماية مسارات الأدمن
 * Admin Only Route Guard
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

/**
 * مكون حماية مسارات HR والأدمن
 * HR and Admin Route Guard
 */
export const HRRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'HR' && user.role !== 'Admin') {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

/**
 * مكون حماية مسارات المستخدمين العاديين
 * Regular User Route Guard
 */
export const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

/**
 * مكون حماية مسارات الضيوف (غير مسجلي الدخول فقط)
 * Guest Only Route Guard
 */
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (user) {
    // توجيه المستخدم المسجل حسب دوره
    if (user.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'HR') {
      return <Navigate to={user.bio ? '/profile' : '/onboarding-companies'} replace />;
    } else {
      return <Navigate to={user.bio ? '/profile' : '/onboarding-individuals'} replace />;
    }
  }

  return children;
};

/**
 * مكون حماية مسارات الإعداد الأولي
 * Onboarding Route Guard
 */
export const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان المستخدم أكمل الإعداد، وجهه للملف الشخصي
  if (user.bio) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;