import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Linkedin,
  Github,
  Globe,
  Twitter,
  Youtube,
  PenTool,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';
import './SocialLinks.css';

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077b5' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#333' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1da1f2' },
  { id: 'behance', name: 'Behance', icon: PenTool, color: '#1769ff' },
  { id: 'website', name: 'الموقع الشخصي', icon: Globe, color: '#D48161' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000' },
  { id: 'medium', name: 'Medium', icon: PenTool, color: '#00ab6c' },
  { id: 'dribbble', name: 'Dribbble', icon: PenTool, color: '#ea4c89' }
];

/**
 * Social Links Section Component
 * Requirements: 6.2
 */
const SocialLinksSection = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ platform: 'linkedin', url: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/social-links');
      setLinks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching social links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('/api/profile/social-links', formData);
      setIsAdding(false);
      setFormData({ platform: 'linkedin', url: '' });
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إضافة الرابط');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/profile/social-links/${id}`);
      setLinks(prev => prev.filter(link => link._id !== id));
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const getIcon = (platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return ExternalLink;
    return platform.icon;
  };

  const getColor = (platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? platform.color : '#666';
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-50 rounded-xl"></div>;

  return (
    <div className="social-links-section bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-amiri text-xl text-primary dark:text-white">روابط التواصل</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-accent hover:bg-accent/10 p-2 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-secondary/20 rounded-xl border border-accent/10 animate-fade-in">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">المنصة</label>
              <select
                className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-accent"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الرابط (URL)</label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-accent"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent text-white py-2 rounded-lg text-sm font-bold shadow-md">
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-500 text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {links.length > 0 ? (
          links.map((link) => {
            const Icon = getIcon(link.platform);
            return (
              <div key={link._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent hover:border-accent/20 transition-all">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: getColor(link.platform) }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {link.platform}
                  </span>
                </a>
                <button
                  onClick={() => handleDelete(link._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-4 italic">لا يوجد روابط مضافة</p>
        )}
      </div>
    </div>
  );
};

export default SocialLinksSection;
