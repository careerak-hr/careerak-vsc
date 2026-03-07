import React, { useEffect } from 'react';
import { useApplicationForm } from '../../context/ApplicationContext';
import './PersonalInfoStep.css';

function PersonalInfoStep({ errors = {} }) {
  const {
    formData,
    setField,
    clearError,
  } = useApplicationForm();

  // Auto-fill from user profile (will be implemented in task 8)
  useEffect(() => {
    // TODO: Load user profile and auto-fill
    // This will be implemented in task 8
  }, []);

  const handleChange = (field, value) => {
    setField(field, value);
    if (errors[field]) {
      clearError(field);
    }
  };

  return (
    <div className="personal-info-step" role="group" aria-labelledby="personal-info-heading">
      <h2 id="personal-info-heading" className="step-heading">Personal Information</h2>
      <p className="step-description">
        Please provide your personal contact information. Fields marked with * are required.
      </p>

      <div className="form-grid" role="group" aria-label="Personal information fields">
        {/* Full Name */}
        <div className="form-group full-width">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            value={formData.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            aria-required="true"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && (
            <span id="fullName-error" className="error-message" role="alert">
              {errors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your.email@example.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-message" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className="error-message" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        {/* Country */}
        <div className="form-group">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <input
            type="text"
            id="country"
            className={`form-input ${errors.country ? 'error' : ''}`}
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Enter your country"
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? 'country-error' : undefined}
          />
          {errors.country && (
            <span id="country-error" className="error-message" role="alert">
              {errors.country}
            </span>
          )}
        </div>

        {/* City */}
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            id="city"
            className={`form-input ${errors.city ? 'error' : ''}`}
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter your city"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && (
            <span id="city-error" className="error-message" role="alert">
              {errors.city}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoStep;
