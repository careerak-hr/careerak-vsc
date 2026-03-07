import React, { useState } from 'react';
import SearchBar from '../components/Search/SearchBar';
import { useApp } from '../context/AppContext';

/**
 * مثال على استخدام شريط البحث الذكي مع الاقتراحات
 * @component
 */
const SmartSearchBarExample = () => {
  const { language, fontFamily } = useApp();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');

  // Translations
  const translations = {
    ar: {
      title: 'شريط البحث الذكي مع الاقتراحات',
      subtitle: 'ابدأ بكتابة 3 أحرف على الأقل لرؤية الاقتراحات',
      jobsTab: 'بحث عن وظائف',
      coursesTab: 'بحث عن دورات',
      searchResults: 'نتائج البحث',
      selectedSuggestion: 'الاقتراح المختار',
      noResults: 'لا توجد نتائج',
      features: 'الميزات',
      feature1: 'اقتراحات ذكية بناءً على سجل البحث',
      feature2: 'بحث في العناوين، المهارات، والشركات',
      feature3: 'دعم كامل للعربية والإنجليزية',
      feature4: 'تنقل بلوحة المفاتيح (↑ ↓ Enter Esc)',
      feature5: 'تحميل سريع مع debounce',
      feature6: 'تصميم متجاوب لجميع الأجهزة'
    },
    en: {
      title: 'Smart Search Bar with Suggestions',
      subtitle: 'Start typing at least 3 characters to see suggestions',
      jobsTab: 'Search Jobs',
      coursesTab: 'Search Courses',
      searchResults: 'Search Results',
      selectedSuggestion: 'Selected Suggestion',
      noResults: 'No results',
      features: 'Features',
      feature1: 'Smart suggestions based on search history',
      feature2: 'Search in titles, skills, and companies',
      feature3: 'Full support for Arabic and English',
      feature4: 'Keyboard navigation (↑ ↓ Enter Esc)',
      feature5: 'Fast loading with debounce',
      feature6: 'Responsive design for all devices'
    },
    fr: {
      title: 'Barre de recherche intelligente avec suggestions',
      subtitle: 'Commencez à taper au moins 3 caractères pour voir les suggestions',
      jobsTab: 'Rechercher des emplois',
      coursesTab: 'Rechercher des cours',
      searchResults: 'Résultats de recherche',
      selectedSuggestion: 'Suggestion sélectionnée',
      noResults: 'Aucun résultat',
      features: 'Fonctionnalités',
      feature1: 'Suggestions intelligentes basées sur l\'historique de recherche',
      feature2: 'Recherche dans les titres, compétences et entreprises',
      feature3: 'Support complet pour l\'arabe et l\'anglais',
      feature4: 'Navigation au clavier (↑ ↓ Entrée Échap)',
      feature5: 'Chargement rapide avec debounce',
      feature6: 'Design responsive pour tous les appareils'
    }
  };

  const t = translations[language] || translations.ar;

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const [activeTab, setActiveTab] = useState('jobs');

  const handleSearch = (query) => {
    console.log('Search:', query);
    setSearchResults([`نتيجة البحث عن: ${query}`]);
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log('Selected suggestion:', suggestion);
    setSelectedSuggestion(suggestion);
    setSearchResults([`تم اختيار: ${suggestion}`]);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', ...fontStyle }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#304B60' }}>
          {t.title}
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'jobs' ? '#D48161' : '#E3DAD1',
            color: activeTab === 'jobs' ? '#ffffff' : '#304B60',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            ...fontStyle
          }}
        >
          {t.jobsTab}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'courses' ? '#D48161' : '#E3DAD1',
            color: activeTab === 'courses' ? '#ffffff' : '#304B60',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            ...fontStyle
          }}
        >
          {t.coursesTab}
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '40px' }}>
        <SearchBar
          type={activeTab}
          onSearch={handleSearch}
          onSuggestionSelect={handleSuggestionSelect}
          autoFocus={true}
          minChars={3}
        />
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        {/* Search Results */}
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#304B60', ...fontStyle }}>
            {t.searchResults}
          </h3>
          {searchResults.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {searchResults.map((result, index) => (
                <li key={index} style={{
                  padding: '10px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  ...fontStyle
                }}>
                  {result}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#6b7280', ...fontStyle }}>{t.noResults}</p>
          )}
        </div>

        {/* Selected Suggestion */}
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#304B60', ...fontStyle }}>
            {t.selectedSuggestion}
          </h3>
          {selectedSuggestion ? (
            <div style={{
              padding: '15px',
              background: '#D4816120',
              borderRadius: '8px',
              border: '2px solid #D48161',
              ...fontStyle
            }}>
              {selectedSuggestion}
            </div>
          ) : (
            <p style={{ color: '#6b7280', ...fontStyle }}>{t.noResults}</p>
          )}
        </div>
      </div>

      {/* Features */}
      <div style={{
        padding: '30px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #D4816180',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#304B60', ...fontStyle }}>
          {t.features}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[t.feature1, t.feature2, t.feature3, t.feature4, t.feature5, t.feature6].map((feature, index) => (
            <li key={index} style={{
              padding: '12px 0',
              borderBottom: index < 5 ? '1px solid #e5e7eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              ...fontStyle
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                background: '#D48161',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✓
              </span>
              <span style={{ color: '#1f2937' }}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartSearchBarExample;
