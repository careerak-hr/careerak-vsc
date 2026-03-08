import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, AlertTriangle, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import './ProfileImprovement.css';

/**
 * Panel to display profile improvement suggestions
 * Requirements: 3.2
 */
const SuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/suggestions');
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (suggestionId) => {
    try {
      await axios.post(`/api/profile/suggestions/${suggestionId}/complete`);
      // Update UI by removing or marking as complete
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error completing suggestion:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="text-red-500" size={20} />;
      case 'medium': return <Lightbulb className="text-yellow-500" size={20} />;
      default: return <Sparkles className="text-blue-500" size={20} />;
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-50 rounded-xl"></div>;
  if (suggestions.length === 0) return null;

  return (
    <div className="suggestions-panel bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="text-accent" />
        <h3 className="font-amiri text-xl">اقتراحات لتحسين ملفك</h3>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`suggestion-card p-4 rounded-xl border-l-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-750 ${
              suggestion.priority === 'high' ? 'border-red-500 bg-red-50/30' :
              suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50/30' :
              'border-blue-500 bg-blue-50/30'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <div className="mt-1">{getPriorityIcon(suggestion.priority)}</div>
                <div>
                  <h4 className="font-bold text-primary dark:text-white">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{suggestion.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleComplete(suggestion.id)}
                className="text-gray-400 hover:text-green-500 transition-colors"
                title="تم التنفيذ"
              >
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
