import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Award, BarChart3, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './SkillsSection.css';

const SKILL_LEVELS = [
  { id: 'beginner', name: 'مبتدئ', percentage: 25, color: '#D48161' },
  { id: 'intermediate', name: 'متوسط', percentage: 50, color: '#E3DAD1' },
  { id: 'advanced', name: 'متقدم', percentage: 75, color: '#304B60' },
  { id: 'expert', name: 'خبير', percentage: 100, color: '#1a2f3f' }
];

const SKILL_CATEGORIES = [
  { id: 'technical', name: 'مهارات تقنية' },
  { id: 'soft', name: 'مهارات شخصية' },
  { id: 'language', name: 'لغات' },
  { id: 'tool', name: 'أدوات وبرامج' }
];

/**
 * Advanced Skills Section Component
 * Requirements: 8.2
 */
const SkillsSection = () => {
  const { language } = useApp();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: 'beginner',
    category: 'technical',
    yearsOfExperience: 1
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/skills');
      setSkills(response.data.data?.skills || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('/api/profile/skills', formData);
      setIsAdding(false);
      setFormData({ name: '', level: 'beginner', category: 'technical', yearsOfExperience: 1 });
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إضافة المهارة');
    }
  };

  const handleDelete = async (skillName) => {
    try {
      await axios.delete(`/api/profile/skills/${skillName}`);
      setSkills(prev => prev.filter(s => s.name !== skillName));
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const getLevelInfo = (levelId) => SKILL_LEVELS.find(l => l.id === levelId);

  if (loading) return <div className="animate-pulse h-48 bg-gray-50 rounded-2xl"></div>;

  return (
    <div className="skills-section bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-accent" size={24} />
          <h2 className="text-xl font-bold text-primary dark:text-white font-amiri">المهارات والخبرات</h2>
        </div>
        {!isAdding && skills.length < 20 && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Plus size={18} />
            إضافة مهارة
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-secondary/10 rounded-2xl border border-accent/10 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المهارة *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-accent/10 bg-white focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: React.js, Python, قيادة الفريق..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الفئة</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-accent/10 bg-white focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {SKILL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">مستوى الإتقان</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-accent/10 bg-white focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                {SKILL_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سنوات الخبرة</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-accent/10 bg-white focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value)})}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn-primary py-3 px-8 flex-1 shadow-lg">حفظ المهارة</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-8 text-gray-500 font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {SKILL_CATEGORIES.map(category => {
          const categorySkills = skills.filter(s => s.category === category.id);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category.id} className="skill-group">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">{category.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorySkills.map((skill) => {
                  const levelInfo = getLevelInfo(skill.level);
                  return (
                    <div key={skill.name} className="skill-card p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary dark:text-white">{skill.name}</span>
                            {skill.yearsOfExperience > 0 && (
                              <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 text-gray-500">
                                {skill.yearsOfExperience} {skill.yearsOfExperience > 10 ? 'عاماً' : 'سنوات'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500" style={{ color: levelInfo.color }}>{levelInfo.name}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(skill.name)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${levelInfo.percentage}%`,
                            backgroundColor: levelInfo.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {skills.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-400 italic">
            ابدأ بإضافة مهاراتك ليعرف أصحاب العمل ما تجيده.
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
