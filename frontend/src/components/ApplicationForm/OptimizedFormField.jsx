import React, { memo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Optimized form field component with debounced validation
 * Uses React.memo to prevent unnecessary re-renders
 */
const OptimizedFormField = memo(({
  name,
  label,
  value,
  onChange,
  onValidate,
  error,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = ''
}) => {
  // Debounce validation to avoid excessive calls
  const debouncedValue = useDebounce(value, 300);

  React.useEffect(() => {
    if (onValidate && debouncedValue !== undefined) {
      onValidate(name, debouncedValue);
    }
  }, [debouncedValue, name, onValidate]);

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-input ${error ? 'error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      
      {error && (
        <span id={`${name}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these props change
  return (
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled
  );
});

OptimizedFormField.displayName = 'OptimizedFormField';

export default OptimizedFormField;
