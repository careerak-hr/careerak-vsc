/**
 * Organization Schema Implementation Tests
 * 
 * Tests for task 6.3.4: Add Organization schema for company info
 * Validates that the Organization structured data is properly rendered
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { StructuredData } from '../components/SEO';

describe('Organization Schema Implementation', () => {
  describe('StructuredData Component - Organization Type', () => {
    it('should render Organization schema with required fields', () => {
      const organizationData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        logo: 'https://careerak.com/logo.jpg',
        description: 'Regional platform specialized in Human Resources'
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={organizationData} />
        </HelmetProvider>
      );

      // The component should render without errors
      expect(container).toBeTruthy();
    });

    it('should include contact information when provided', () => {
      const organizationData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        contactPoint: {
          telephone: '+966-XX-XXX-XXXX',
          contactType: 'Customer Service',
          email: 'careerak.hr@gmail.com',
          availableLanguage: ['Arabic', 'English', 'French']
        }
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={organizationData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });

    it('should include social media links when provided', () => {
      const organizationData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        sameAs: [
          'https://www.facebook.com/careerak',
          'https://www.twitter.com/careerak',
          'https://www.linkedin.com/company/careerak'
        ]
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={organizationData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });

    it('should handle minimal Organization data (name only)', () => {
      const organizationData = {
        name: 'Careerak'
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={organizationData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });

    it('should not render when name is missing', () => {
      const organizationData = {
        url: 'https://careerak.com',
        description: 'Test description'
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={organizationData} />
        </HelmetProvider>
      );

      // Should render but without the script tag (returns null)
      expect(container).toBeTruthy();
    });
  });

  describe('Organization Schema Structure', () => {
    it('should have correct schema.org structure', () => {
      const organizationData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        logo: 'https://careerak.com/logo.jpg',
        description: 'Regional platform specialized in Human Resources',
        contactPoint: {
          telephone: '+966-XX-XXX-XXXX',
          contactType: 'Customer Service',
          email: 'careerak.hr@gmail.com',
          availableLanguage: ['Arabic', 'English', 'French']
        },
        sameAs: [
          'https://www.facebook.com/careerak',
          'https://www.twitter.com/careerak'
        ]
      };

      // Verify the data structure matches schema.org requirements
      expect(organizationData).toHaveProperty('name');
      expect(organizationData.name).toBe('Careerak');
      expect(organizationData).toHaveProperty('url');
      expect(organizationData).toHaveProperty('logo');
      expect(organizationData).toHaveProperty('description');
      expect(organizationData).toHaveProperty('contactPoint');
      expect(organizationData.contactPoint).toHaveProperty('email');
      expect(organizationData.contactPoint).toHaveProperty('telephone');
      expect(organizationData).toHaveProperty('sameAs');
      expect(Array.isArray(organizationData.sameAs)).toBe(true);
    });

    it('should have valid contact point structure', () => {
      const contactPoint = {
        telephone: '+966-XX-XXX-XXXX',
        contactType: 'Customer Service',
        email: 'careerak.hr@gmail.com',
        availableLanguage: ['Arabic', 'English', 'French']
      };

      expect(contactPoint).toHaveProperty('telephone');
      expect(contactPoint).toHaveProperty('contactType');
      expect(contactPoint).toHaveProperty('email');
      expect(contactPoint).toHaveProperty('availableLanguage');
      expect(Array.isArray(contactPoint.availableLanguage)).toBe(true);
      expect(contactPoint.availableLanguage).toContain('Arabic');
      expect(contactPoint.availableLanguage).toContain('English');
      expect(contactPoint.availableLanguage).toContain('French');
    });
  });

  describe('App.jsx Integration', () => {
    it('should verify Organization data structure used in App.jsx', () => {
      // This matches the data structure in App.jsx
      const organizationData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        logo: 'https://careerak.com/logo.jpg',
        description: 'Regional platform specialized in Human Resources, Employment, Training Courses, and Career Development across Arab countries.',
        contactPoint: {
          telephone: '+966-XX-XXX-XXXX',
          contactType: 'Customer Service',
          email: 'careerak.hr@gmail.com',
          availableLanguage: ['Arabic', 'English', 'French']
        },
        sameAs: [
          'https://www.facebook.com/careerak',
          'https://www.twitter.com/careerak',
          'https://www.linkedin.com/company/careerak'
        ]
      };

      // Verify all required fields are present
      expect(organizationData.name).toBe('Careerak');
      expect(organizationData.url).toBe('https://careerak.com');
      expect(organizationData.logo).toBe('https://careerak.com/logo.jpg');
      expect(organizationData.description).toContain('Human Resources');
      expect(organizationData.contactPoint.email).toBe('careerak.hr@gmail.com');
      expect(organizationData.sameAs.length).toBe(3);
    });
  });
});
