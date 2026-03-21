import React, { useState, useEffect } from 'react';
import './BadgeSystemExample.css';

/**
 * Badge System Example
 * Demonstrates how to use the badge system
 */

// Badge Display Component
const BadgeCard = ({ badge, earned, progress, lang = 'ar' }) => {
  const rarityColors = {
    common: '#4CAF50',
    rare: '#FF9800',
    epic: '#9C27B0',
    legendary: '#304B60'
  };
  
  return (
    <div className={`badge-card ${earned ? 'earned' : 'locked'}`}>
      <div className="badge-icon" style={{ fontSize: '48px' }}>
        {badge.icon}
      </div>
      <div className="badge-info">
        <h3 className="badge-name">{badge.name}</h3>
        <p className="badge-description">{badge.description}</p>
        <div className="badge-meta">
          <span 
            className="badge-rarity" 
            style={{ backgroundColor: rarityColors[badge.rarity] }}
          >
            {badge.rarity}
          </span>
          <span className="badge-points">
            {badge.points} نقطة
          </span>
        </div>
        {!earned && progress !== undefined && (
          <div className="badge-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};


// Badges Gallery Component
const BadgesGallery = ({ token }) => {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchBadgesAndProgress();
  }, []);
  
  const fetchBadgesAndProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch all badges
      const badgesRes = await fetch('/api/badges?lang=ar');
      const badgesData = await badgesRes.json();
      
      // Fetch user progress
      const progressRes = await fetch('/api/badges/progress?lang=ar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const progressData = await progressRes.json();
      
      setBadges(badgesData.data);
      setProgress(progressData.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredProgress = progress.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'earned') return item.earned;
    if (filter === 'locked') return !item.earned;
    return true;
  });
  
  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }
  
  return (
    <div className="badges-gallery">
      <div className="gallery-header">
        <h2>🏆 الإنجازات</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            الكل ({progress.length})
          </button>
          <button 
            className={filter === 'earned' ? 'active' : ''}
            onClick={() => setFilter('earned')}
          >
            المكتسبة ({progress.filter(p => p.earned).length})
          </button>
          <button 
            className={filter === 'locked' ? 'active' : ''}
            onClick={() => setFilter('locked')}
          >
            المقفلة ({progress.filter(p => !p.earned).length})
          </button>
        </div>
      </div>
      
      <div className="badges-grid">
        {filteredProgress.map((item, index) => (
          <BadgeCard
            key={index}
            badge={item.badge}
            earned={item.earned}
            progress={item.progress}
          />
        ))}
      </div>
    </div>
  );
};


// Badge Stats Component
const BadgeStats = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/badges/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || !stats) {
    return <div className="loading">جاري التحميل...</div>;
  }
  
  return (
    <div className="badge-stats">
      <h3>📊 إحصائيات الإنجازات</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.earnedBadges}</div>
          <div className="stat-label">إنجازات مكتسبة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPoints}</div>
          <div className="stat-label">مجموع النقاط</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completionPercentage}%</div>
          <div className="stat-label">نسبة الإكمال</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.remainingBadges}</div>
          <div className="stat-label">إنجازات متبقية</div>
        </div>
      </div>
    </div>
  );
};

// Main Example Component
const BadgeSystemExample = () => {
  const token = 'your_jwt_token_here'; // Replace with actual token
  
  return (
    <div className="badge-system-example">
      <h1>نظام الإنجازات - مثال</h1>
      <BadgeStats token={token} />
      <BadgesGallery token={token} />
    </div>
  );
};

export default BadgeSystemExample;
export { BadgeCard, BadgesGallery, BadgeStats };
