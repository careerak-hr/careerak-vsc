import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import LazyImage from '../LazyImage/LazyImage';
import './CourseCard.css';

const CourseCard = ({ course, view = 'grid' }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Translations
  const translations = {
    ar: {
      free: 'مجاني',
      lessons: 'درس',
      hours: 'ساعة',
      students: 'طالب',
      reviews: 'تقييم',
      viewDetails: 'عرض التفاصيل',
      addToWishlist: 'إضافة للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      badges: {
        most_popular: 'الأكثر شعبية',
        new: 'جديد',
        recommended: 'موصى به',
        top_rated: 'الأعلى تقييماً'
      },
      levels: {
        Beginner: 'مبتدئ',
        Intermediate: 'متوسط',
        Advanced: 'متقدم'
      }
    },
    en: {
      free: 'Free',
      lessons: 'lessons',
      hours: 'hours',
      students: 'students',
      reviews: 'reviews',
      viewDetails: 'View Details',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      badges: {
        most_popular: 'Most Popular',
        new: 'New',
        recommended: 'Recommended',
        top_rated: 'Top Rated'
      },
      levels: {
        Beginner: 'Beginner',
        Intermediate: 'Intermediate',
        Advanced: 'Advanced'
      }
    },
    fr: {
      free: 'Gratuit',
      lessons: 'leçons',
      hours: 'heures',
      students: 'étudiants',
      reviews: 'avis',
      viewDetails: 'Voir les détails',
      addToWishlist: 'Ajouter aux favoris',
      removeFromWishlist: 'Retirer des favoris',
      badges: {
        most_popular: 'Le plus populaire',
        new: 'Nouveau',
        recommended: 'Recommandé',
        top_rated: 'Mieux noté'
      },
      levels: {
        Beginner: 'Débutant',
        Intermediate: 'Intermédiaire',
        Advanced: 'Avancé'
      }
    }
  };

  const t = translations[language] || translations.en;

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist/${course._id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    navigate(`/courses/${course._id}`);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star star-full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star star-half">★</span>);
      } else {
        stars.push(<span key={i} className="star star-empty">☆</span>);
      }
    }

    return stars;
  };

  // Render badges
  const renderBadges = () => {
    if (!course.badges || course.badges.length === 0) return null;

    return (
      <div className="course-badges">
        {course.badges.map((badge, index) => (
          <span key={index} className={`badge badge-${badge.type}`}>
            {t.badges[badge.type]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`course-card course-card-${view}`} onClick={handleViewDetails}>
      {/* Thumbnail */}
      <div className="course-thumbnail">
        <LazyImage
          publicId={course.thumbnail}
          alt={course.title}
          preset="THUMBNAIL_MEDIUM"
          placeholder={true}
        />
        
        {/* Badges overlay */}
        {renderBadges()}

        {/* Wishlist button */}
        <button
          className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Content */}
      <div className="course-content">
        {/* Title */}
        <h3 className="course-title">{course.title}</h3>

        {/* Description */}
        <p className="course-description">{course.description}</p>

        {/* Stats */}
        <div className="course-stats">
          {/* Rating */}
          <div className="course-rating">
            <div className="stars">
              {renderStars(course.stats?.averageRating || 0)}
            </div>
            <span className="rating-value">
              {(course.stats?.averageRating || 0).toFixed(1)}
            </span>
            <span className="review-count">
              ({course.stats?.totalReviews || 0} {t.reviews})
            </span>
          </div>

          {/* Enrollment count */}
          <div className="course-enrollment">
            <span className="enrollment-icon">👥</span>
            <span className="enrollment-count">
              {course.stats?.totalEnrollments || 0} {t.students}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="course-details">
          {/* Level */}
          <div className="detail-item">
            <span className="detail-icon">📊</span>
            <span className="detail-text">{t.levels[course.level]}</span>
          </div>

          {/* Duration */}
          <div className="detail-item">
            <span className="detail-icon">⏱️</span>
            <span className="detail-text">
              {course.totalDuration} {t.hours}
            </span>
          </div>

          {/* Lessons */}
          <div className="detail-item">
            <span className="detail-icon">📚</span>
            <span className="detail-text">
              {course.totalLessons} {t.lessons}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="course-footer">
          {/* Price */}
          <div className="course-price">
            {course.price?.isFree ? (
              <span className="price-free">{t.free}</span>
            ) : (
              <span className="price-amount">
                {course.price?.amount} {course.price?.currency || 'USD'}
              </span>
            )}
          </div>

          {/* View Details button */}
          <button className="view-details-button" onClick={handleViewDetails}>
            {t.viewDetails}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
