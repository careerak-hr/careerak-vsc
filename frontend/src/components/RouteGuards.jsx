import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext'; // Corrected import
import { GlobalLoader } from './GlobalLoaders';

/**
 * Protected Route Component - Requires Authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { user, isAppLoading } = useApp(); // Corrected hook
  const location = useLocation();

  if (isAppLoading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Admin Only Route Guard
 */
export const AdminRoute = ({ children }) => {
  const { user, isAppLoading } = useApp(); // Corrected hook

  if (isAppLoading) {
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
 * HR and Admin Route Guard
 */
export const HRRoute = ({ children }) => {
  const { user, isAppLoading } = useApp(); // Corrected hook

  if (isAppLoading) {
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
 * Guest Only Route Guard
 */
export const GuestRoute = ({ children }) => {
  const { user, isAppLoading } = useApp(); // Corrected hook

  if (isAppLoading) {
    return <GlobalLoader />;
  }

  if (user) {
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
 * Onboarding Route Guard
 */
export const OnboardingRoute = ({ children }) => {
  const { user, isAppLoading } = useApp(); // Corrected hook

  if (isAppLoading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.bio) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

// Note: UserRoute was not used in AppRoutes, so it is removed for now.
// If needed, it can be updated in the same way.

export default ProtectedRoute;
