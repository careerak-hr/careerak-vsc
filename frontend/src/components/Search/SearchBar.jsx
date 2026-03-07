import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import PropTypes from 'prop-types';
import './SearchBar.css';

/**
 * شريط البحث مع الاقتراحات التلقائية (Autocomplete)
 * يدعم RTL/LTR والبحث في الحقول المتعددة
 * @component
 */
const SearchBar = ({
  initialValue = '',
  onSearch,
  onSuggestionSelect,
  placeholder,
  autoFocus = false,
  type = 'jobs', // 'jobs' or 'courses'
  minChars = 3
}) => {
  const { language, fontFamily } = useApp();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Translations
  const translations = {
    ar: {
      searchPlaceholder: 'ابحث عن وظائف، مهارات، شركات...',
      searchCoursesPlaceholder: 'ابحث عن دورات، مواضيع، مدربين...',
      searchButton: 'بحث',
      noSuggestions: 'لا توجد اقتراحات',
      searching: 'جاري البحث...'
    },
    en: {
      searchPlaceholder: 'Search for jobs, skills, companies...',
      searchCoursesPlaceholder: 'Search for courses, topics, instructors...',
      searchButton: 'Search',
      noSuggestions: 'No suggestions',
      searching: 'Searching...'
    },
    fr: {
      searchPlaceholder: 'Rechercher des emplois, compétences, entreprises...',
      searchCoursesPlaceholder: 'Rechercher des cours, sujets, formateurs...',
      searchButton: 'Rechercher',
      noSuggestions: 'Aucune suggestion',
      searching: 'Recherche en cours...'
    }
  };

  const t = translations[language] || translations.ar;
  const defaultPlaceholder = type === 'courses' ? t.searchCoursesPlaceholder : t.searchPlaceholder;

  // Font style for inline application
  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  /**
   * جلب الاقتراحات من API
   */
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < minChars) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=10`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data?.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, minChars]);

  /**
   * معالجة تغيير النص مع debounce
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    if (value.length >= minChars) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * معالجة إرسال البحث
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  };

  /**
   * معالجة اختيار اقتراح
   */
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      onSearch(suggestion);
    }
  };

  /**
   * معالجة التنقل بلوحة المفاتيح
   */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  /**
   * إغلاق الاقتراحات عند النقر خارجها
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Auto focus
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Cleanup debounce timer
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="search-bar-wrapper" style={fontStyle}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.length >= minChars && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder || defaultPlaceholder}
            aria-label={placeholder || defaultPlaceholder}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
            style={fontStyle}
          />
          
          {/* Search Icon */}
          <button
            type="submit"
            className="search-button"
            aria-label={t.searchButton}
            disabled={!query.trim()}
          >
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="search-loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            id="search-suggestions"
            className="suggestions-dropdown"
            role="listbox"
            style={fontStyle}
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${
                    index === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSuggestionClick(suggestion);
                    }
                  }}
                >
                  <svg
                    className="suggestion-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="suggestion-text">{suggestion}</span>
                </div>
              ))
            ) : (
              <div className="no-suggestions">
                {isLoading ? t.searching : t.noSuggestions}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  initialValue: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onSuggestionSelect: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  type: PropTypes.oneOf(['jobs', 'courses']),
  minChars: PropTypes.number
};

export default SearchBar;
