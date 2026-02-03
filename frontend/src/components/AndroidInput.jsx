import React, { useState, useRef, useEffect } from 'react';

/**
 * مكون حقل إدخال بديل لـ Android
 * Alternative input component for Android using contenteditable
 */
const AndroidInput = ({ 
  type = 'text', 
  placeholder = '', 
  value = '', 
  onChange, 
  className = '',
  style = {},
  name = '',
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInput = (e) => {
    const newValue = e.target.textContent || '';
    setInternalValue(newValue);
    
    if (onChange) {
      // إنشاء حدث مشابه لـ input
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          type: type
        },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    console.log('🎯 AndroidInput focused');
  };

  const handleBlur = () => {
    setIsFocused(false);
    console.log('😵 AndroidInput blurred');
  };

  const handleKeyDown = (e) => {
    // منع إدخال أسطر جديدة
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.blur();
    }
  };

  const baseStyle = {
    minHeight: '20px',
    outline: 'none',
    cursor: 'text',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    touchAction: 'manipulation',
    ...style
  };

  const focusStyle = isFocused ? {
    borderColor: '#304B60',
    boxShadow: '0 0 5px rgba(48, 75, 96, 0.3)'
  } : {};

  // للحقول من نوع password
  if (type === 'password') {
    return (
      <div className="relative">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={className}
          style={{
            ...baseStyle,
            ...focusStyle,
            WebkitTextSecurity: showPassword ? 'none' : 'disc',
            textSecurity: showPassword ? 'none' : 'disc'
          }}
          data-placeholder={placeholder}
          {...props}
        >
          {showPassword ? internalValue : ''}
        </div>
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304B60]/40 hover:text-[#304B60] transition-colors"
          style={{ pointerEvents: 'auto' }}
        >
          {showPassword ? '👁️' : '🙈'}
        </button>
        
        {!internalValue && !isFocused && (
          <div 
            className="absolute top-0 left-0 w-full h-full flex items-center px-4 text-gray-400 pointer-events-none"
            style={{ fontSize: 'inherit' }}
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }

  // للحقول العادية
  return (
    <div className="relative">
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
        style={{
          ...baseStyle,
          ...focusStyle
        }}
        data-placeholder={placeholder}
        {...props}
      >
        {internalValue}
      </div>
      
      {!internalValue && !isFocused && (
        <div 
          className="absolute top-0 left-0 w-full h-full flex items-center px-4 text-gray-400 pointer-events-none"
          style={{ fontSize: 'inherit' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default AndroidInput;