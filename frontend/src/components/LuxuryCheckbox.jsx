import React from 'react';

/**
 * مكون مربع تشيك فاخر يتناسب مع هوية التطبيق
 * Luxury Checkbox Component matching app's premium design
 */
const LuxuryCheckbox = ({ 
  id, 
  checked, 
  onChange, 
  label, 
  className = '', 
  labelClassName = '',
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'primary', // 'primary', 'secondary'
  disabled = false,
  style = {},
  labelStyle = {},
  ...props 
}) => {
  // تحديد الأحجام
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // تحديد الألوان حسب النوع
  const variants = {
    primary: {
      unchecked: 'border-[#D48161]/40 bg-[#E3DAD1]',
      checked: 'border-[#304B60] bg-[#304B60]',
      hover: 'hover:border-[#D48161] hover:shadow-md',
      focus: 'focus:ring-2 focus:ring-[#304B60]/20 focus:border-[#304B60]'
    },
    secondary: {
      unchecked: 'border-[#304B60]/40 bg-[#E3DAD1]',
      checked: 'border-[#D48161] bg-[#D48161]',
      hover: 'hover:border-[#304B60] hover:shadow-md',
      focus: 'focus:ring-2 focus:ring-[#D48161]/20 focus:border-[#D48161]'
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`} style={style}>
      <div className="relative">
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
          {...props}
        />
        
        {/* Custom checkbox design */}
        <label
          htmlFor={id}
          className={`
            ${currentSize}
            ${checked ? currentVariant.checked : currentVariant.unchecked}
            ${!disabled ? currentVariant.hover : 'opacity-50 cursor-not-allowed'}
            ${!disabled ? currentVariant.focus : ''}
            ${!disabled ? 'cursor-pointer' : ''}
            border-2 rounded-lg
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            shadow-sm
            relative overflow-hidden
            group
          `}
        >
          {/* Checkmark with animation */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          `}>
            {/* Custom checkmark icon */}
            <svg 
              className="w-3 h-3 text-white drop-shadow-sm" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          {/* Ripple effect on click */}
          <div className={`
            absolute inset-0 rounded-lg
            bg-gradient-to-r from-[#304B60]/10 to-[#D48161]/10
            opacity-0 group-active:opacity-100
            transition-opacity duration-150
          `} />
        </label>
      </div>
      
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`
            cursor-pointer select-none
            transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#304B60]'}
            ${labelClassName}
          `}
          style={labelStyle}
        >
          {label}
        </label>
      )}
    </div>
  );
};

/**
 * مكون مربع تشيك فاخر مع تأثيرات متقدمة
 * Premium Checkbox with Advanced Effects
 */
export const PremiumCheckbox = ({ 
  id, 
  checked, 
  onChange, 
  label, 
  className = '', 
  labelClassName = '',
  disabled = false,
  style = {},
  labelStyle = {},
  ...props 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={style}>
      <div className="relative">
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
          {...props}
        />
        
        {/* Premium checkbox design */}
        <label
          htmlFor={id}
          className={`
            w-6 h-6
            ${checked 
              ? 'bg-gradient-to-br from-[#304B60] to-[#304B60]/80 border-[#304B60]' 
              : 'bg-gradient-to-br from-[#E3DAD1] to-[#E3DAD1]/90 border-[#D48161]/40'
            }
            ${!disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'opacity-50 cursor-not-allowed'}
            border-2 rounded-xl
            transition-all duration-300 ease-out
            flex items-center justify-center
            shadow-md
            relative overflow-hidden
            group
            backdrop-blur-sm
          `}
        >
          {/* Animated background gradient */}
          <div className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-br from-[#D48161]/20 to-[#304B60]/20
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          `} />
          
          {/* Checkmark with smooth animation */}
          <div className={`
            relative z-10
            transition-all duration-300 ease-out
            ${checked ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-45'}
          `}>
            <svg 
              className="w-4 h-4 text-white drop-shadow-md" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3.5} 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          {/* Shine effect */}
          <div className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            -translate-x-full group-hover:translate-x-full
            transition-transform duration-700 ease-in-out
          `} />
        </label>
      </div>
      
      {/* Premium label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`
            cursor-pointer select-none
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#304B60] hover:scale-[1.02]'}
            ${labelClassName}
          `}
          style={labelStyle}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default LuxuryCheckbox;