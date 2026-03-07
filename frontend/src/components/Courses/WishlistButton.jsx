import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './WishlistButton.css';

const WishlistButton = ({ courseId, size = 'medium', showLabel = false }) => {
  const { user, language } = useApp();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const translations = {
    ar: {
      addToWishlist: 'إضافة للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      added: 'تمت الإضافة للمفضلة',
      removed: 'تمت الإزالة من المفضلة',
      error: 'حدث خطأ، حاول مرة أخرى'
    },
    en: {
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      loginRequired: 'Please login first',
      added: 'Added to wishlist',
      removed: 'Removed from wishlist',
      error: 'An error occurred, please try again'
    },
    fr: {
      addToWishlist: 'Ajouter aux favoris',
      removeFromWishlist: 'Retirer des favoris',
      loginRequired: 'Veuillez vous connecter d\'abord',
      added: 'Ajouté aux favoris',
      removed: 'Retiré des favoris',
      error: 'Une erreur s\'est produite, veuillez réessayer'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, courseId]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const wishlist = await response.json();
        const isInWishlist = wishlist.courses?.some(item => item.course._id === courseId);
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert(t.loginRequired);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/wishlist/${courseId}`;
      const method = isWishlisted ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        
        // Show success message
        const message = isWishlisted ? t.removed : t.added;
        showNotification(message, 'success');
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showNotification(t.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - can be replaced with a toast library
    const notification = document.createElement('div');
    notification.className = `wishlist-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const sizeClass = `wishlist-button-${size}`;
  const title = isWishlisted ? t.removeFromWishlist : t.addToWishlist;

  return (
    <button
      className={`wishlist-button ${sizeClass} ${isWishlisted ? 'wishlisted' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggleWishlist}
      disabled={loading}
      title={title}
      aria-label={title}
    >
      {loading ? (
        <span className="wishlist-spinner"></span>
      ) : (
        <svg
          className="wishlist-icon"
          viewBox="0 0 24 24"
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      {showLabel && <span className="wishlist-label">{title}</span>}
    </button>
  );
};

export default WishlistButton;
