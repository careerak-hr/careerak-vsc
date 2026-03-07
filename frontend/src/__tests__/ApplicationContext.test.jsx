import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApplicationProvider, useApplicationForm, ACTION_TYPES } from '../context/ApplicationContext';

/**
 * Unit Tests for ApplicationContext and State Management
 * 
 * Tests reducer actions, state updates, and context provider
 * Validates: Requirements 7.7
 * 
 * Feature: apply-page-enhancements
 */

describe('ApplicationContext', () => {
  const wrapper = ({ children }) => (
    <ApplicationProvider jobPostingId="test-job-123">
      {children}
    </ApplicationProvider>
  );

  describe('Context Provider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isDraft).toBe(false);
      expect(result.current.draftId).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBe(null);
      expect(result.current.errors).toEqual({});
      expect(result.current.formData).toBeDefined();
      expect(result.current.jobPostingId).toBe('test-job-123');
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useApplicationForm());
      }).toThrow('useApplicationForm must be used within an ApplicationProvider');
    });

    it('should provide all action functions', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      expect(typeof result.current.setField).toBe('function');
      expect(typeof result.current.setStep).toBe('function');
      expect(typeof result.current.setFiles).toBe('function');
      expect(typeof result.current.addFile).toBe('function');
      expect(typeof result.current.removeFile).toBe('function');
      expect(typeof result.current.setErrors).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setSaving).toBe('function');
      expect(typeof result.current.setDraftId).toBe('function');
      expect(typeof result.current.setLastSaved).toBe('function');
      expect(typeof result.current.loadDraft).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.setCustomAnswer).toBe('function');
      expect(typeof result.current.setEducationEntry).toBe('function');
      expect(typeof result.current.addEducationEntry).toBe('function');
      expect(typeof result.current.removeEducationEntry).toBe('function');
      expect(typeof result.current.setExperienceEntry).toBe('function');
      expect(typeof result.current.addExperienceEntry).toBe('function');
      expect(typeof result.current.removeExperienceEntry).toBe('function');
      expect(typeof result.current.setSkill).toBe('function');
      expect(typeof result.current.addSkill).toBe('function');
      expect(typeof result.current.removeSkill).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.addLanguage).toBe('function');
      expect(typeof result.current.removeLanguage).toBe('function');
    });
  });

  describe('Reducer Actions - Basic Fields', () => {
    it('should update field value with SET_FIELD', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', 'John Doe');
      });

      expect(result.current.formData.fullName).toBe('John Doe');
    });

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', 'John Doe');
        result.current.setField('email', 'john@example.com');
        result.current.setField('phone', '+1234567890');
      });

      expect(result.current.formData.fullName).toBe('John Doe');
      expect(result.current.formData.email).toBe('john@example.com');
      expect(result.current.formData.phone).toBe('+1234567890');
    });

    it('should update current step with SET_STEP', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setStep(3);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('Reducer Actions - File Management', () => {
    it('should set files array with SET_FILES', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const files = [
        { id: '1', name: 'resume.pdf', size: 1024, type: 'application/pdf' },
        { id: '2', name: 'cover.pdf', size: 2048, type: 'application/pdf' },
      ];

      act(() => {
        result.current.setFiles(files);
      });

      expect(result.current.formData.files).toEqual(files);
      expect(result.current.formData.files.length).toBe(2);
    });

    it('should add file with ADD_FILE', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const file = { id: '1', name: 'resume.pdf', size: 1024, type: 'application/pdf' };

      act(() => {
        result.current.addFile(file);
      });

      expect(result.current.formData.files).toContainEqual(file);
      expect(result.current.formData.files.length).toBe(1);
    });

    it('should remove file with REMOVE_FILE', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const files = [
        { id: '1', name: 'resume.pdf', size: 1024, type: 'application/pdf' },
        { id: '2', name: 'cover.pdf', size: 2048, type: 'application/pdf' },
      ];

      act(() => {
        result.current.setFiles(files);
        result.current.removeFile('1');
      });

      expect(result.current.formData.files.length).toBe(1);
      expect(result.current.formData.files[0].id).toBe('2');
    });

    it('should handle adding multiple files sequentially', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addFile({ id: '1', name: 'file1.pdf' });
        result.current.addFile({ id: '2', name: 'file2.pdf' });
        result.current.addFile({ id: '3', name: 'file3.pdf' });
      });

      expect(result.current.formData.files.length).toBe(3);
    });
  });

  describe('Reducer Actions - Error Management', () => {
    it('should set all errors with SET_ERRORS', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const errors = {
        fullName: 'Name is required',
        email: 'Invalid email',
      };

      act(() => {
        result.current.setErrors(errors);
      });

      expect(result.current.errors).toEqual(errors);
    });

    it('should set single error with SET_ERROR', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setError('email', 'Invalid email format');
      });

      expect(result.current.errors.email).toBe('Invalid email format');
    });

    it('should clear error with CLEAR_ERROR', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setError('email', 'Invalid email');
        result.current.clearError('email');
      });

      expect(result.current.errors.email).toBeUndefined();
    });

    it('should handle multiple errors independently', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setError('fullName', 'Name required');
        result.current.setError('email', 'Email required');
        result.current.clearError('fullName');
      });

      expect(result.current.errors.fullName).toBeUndefined();
      expect(result.current.errors.email).toBe('Email required');
    });
  });

  describe('Reducer Actions - Loading States', () => {
    it('should set loading state with SET_LOADING', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set saving state with SET_SAVING', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.setSaving(false);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Reducer Actions - Draft Management', () => {
    it('should set draft ID with SET_DRAFT_ID', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setDraftId('draft-123');
      });

      expect(result.current.draftId).toBe('draft-123');
      expect(result.current.isDraft).toBe(true);
    });

    it('should set isDraft to false when draftId is null', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setDraftId('draft-123');
        result.current.setDraftId(null);
      });

      expect(result.current.draftId).toBe(null);
      expect(result.current.isDraft).toBe(false);
    });

    it('should set last saved timestamp with SET_LAST_SAVED', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const timestamp = new Date();

      act(() => {
        result.current.setLastSaved(timestamp);
      });

      expect(result.current.lastSaved).toBe(timestamp);
    });

    it('should load draft data with LOAD_DRAFT', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const draftData = {
        currentStep: 3,
        draftId: 'draft-456',
        formData: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
        },
      };

      act(() => {
        result.current.loadDraft(draftData);
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.draftId).toBe('draft-456');
      expect(result.current.isDraft).toBe(true);
      expect(result.current.formData.fullName).toBe('Jane Doe');
    });

    it('should reset form with RESET_FORM', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', 'John Doe');
        result.current.setStep(3);
        result.current.resetForm();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.fullName).toBe('');
    });

    it('should reset form with partial new data', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.resetForm({ fullName: 'New User', email: 'new@example.com' });
      });

      expect(result.current.formData.fullName).toBe('New User');
      expect(result.current.formData.email).toBe('new@example.com');
    });
  });

  describe('Reducer Actions - Custom Answers', () => {
    it('should set custom answer with SET_CUSTOM_ANSWER', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setCustomAnswer('q1', 'My answer');
      });

      expect(result.current.formData.customAnswers.q1).toBe('My answer');
    });

    it('should handle multiple custom answers', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setCustomAnswer('q1', 'Answer 1');
        result.current.setCustomAnswer('q2', 'Answer 2');
        result.current.setCustomAnswer('q3', 'Answer 3');
      });

      expect(result.current.formData.customAnswers.q1).toBe('Answer 1');
      expect(result.current.formData.customAnswers.q2).toBe('Answer 2');
      expect(result.current.formData.customAnswers.q3).toBe('Answer 3');
    });
  });

  describe('Reducer Actions - Education Management', () => {
    it('should add education entry with ADD_EDUCATION_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const entry = {
        level: 'Bachelor',
        degree: 'Computer Science',
        institution: 'MIT',
        year: '2020',
      };

      act(() => {
        result.current.addEducationEntry(entry);
      });

      expect(result.current.formData.education.length).toBe(1);
      expect(result.current.formData.education[0]).toEqual(entry);
    });

    it('should update education entry with SET_EDUCATION_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addEducationEntry({ level: 'Bachelor', degree: 'CS' });
        result.current.setEducationEntry(0, { level: 'Master', degree: 'AI' });
      });

      expect(result.current.formData.education[0].level).toBe('Master');
      expect(result.current.formData.education[0].degree).toBe('AI');
    });

    it('should remove education entry with REMOVE_EDUCATION_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addEducationEntry({ level: 'Bachelor' });
        result.current.addEducationEntry({ level: 'Master' });
        result.current.removeEducationEntry(0);
      });

      expect(result.current.formData.education.length).toBe(1);
      expect(result.current.formData.education[0].level).toBe('Master');
    });

    it('should handle multiple education entries', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addEducationEntry({ level: 'High School' });
        result.current.addEducationEntry({ level: 'Bachelor' });
        result.current.addEducationEntry({ level: 'Master' });
      });

      expect(result.current.formData.education.length).toBe(3);
    });
  });

  describe('Reducer Actions - Experience Management', () => {
    it('should add experience entry with ADD_EXPERIENCE_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const entry = {
        company: 'Google',
        position: 'Software Engineer',
        from: '2020-01-01',
        to: '2022-12-31',
      };

      act(() => {
        result.current.addExperienceEntry(entry);
      });

      expect(result.current.formData.experience.length).toBe(1);
      expect(result.current.formData.experience[0]).toEqual(entry);
    });

    it('should update experience entry with SET_EXPERIENCE_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addExperienceEntry({ company: 'Google', position: 'Junior' });
        result.current.setExperienceEntry(0, { company: 'Microsoft', position: 'Senior' });
      });

      expect(result.current.formData.experience[0].company).toBe('Microsoft');
      expect(result.current.formData.experience[0].position).toBe('Senior');
    });

    it('should remove experience entry with REMOVE_EXPERIENCE_ENTRY', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addExperienceEntry({ company: 'Google' });
        result.current.addExperienceEntry({ company: 'Microsoft' });
        result.current.removeExperienceEntry(0);
      });

      expect(result.current.formData.experience.length).toBe(1);
      expect(result.current.formData.experience[0].company).toBe('Microsoft');
    });
  });

  describe('Reducer Actions - Skills Management', () => {
    it('should add skill with ADD_SKILL', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const skill = { skill: 'JavaScript', proficiency: 'expert' };

      act(() => {
        result.current.addSkill('computerSkills', skill);
      });

      expect(result.current.formData.computerSkills.length).toBe(1);
      expect(result.current.formData.computerSkills[0]).toEqual(skill);
    });

    it('should update skill with SET_SKILL', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addSkill('computerSkills', { skill: 'JavaScript', proficiency: 'beginner' });
        result.current.setSkill('computerSkills', 0, { skill: 'JavaScript', proficiency: 'expert' });
      });

      expect(result.current.formData.computerSkills[0].proficiency).toBe('expert');
    });

    it('should remove skill with REMOVE_SKILL', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addSkill('computerSkills', { skill: 'JavaScript' });
        result.current.addSkill('computerSkills', { skill: 'Python' });
        result.current.removeSkill('computerSkills', 0);
      });

      expect(result.current.formData.computerSkills.length).toBe(1);
      expect(result.current.formData.computerSkills[0].skill).toBe('Python');
    });

    it('should handle different skill categories', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addSkill('computerSkills', { skill: 'JavaScript' });
        result.current.addSkill('softwareSkills', { software: 'Photoshop' });
        result.current.addSkill('otherSkills', 'Communication');
      });

      expect(result.current.formData.computerSkills.length).toBe(1);
      expect(result.current.formData.softwareSkills.length).toBe(1);
      expect(result.current.formData.otherSkills.length).toBe(1);
    });
  });

  describe('Reducer Actions - Language Management', () => {
    it('should add language with ADD_LANGUAGE', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });
      const language = { language: 'English', proficiency: 'native' };

      act(() => {
        result.current.addLanguage(language);
      });

      expect(result.current.formData.languages.length).toBe(1);
      expect(result.current.formData.languages[0]).toEqual(language);
    });

    it('should update language with SET_LANGUAGE', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addLanguage({ language: 'English', proficiency: 'beginner' });
        result.current.setLanguage(0, { language: 'English', proficiency: 'advanced' });
      });

      expect(result.current.formData.languages[0].proficiency).toBe('advanced');
    });

    it('should remove language with REMOVE_LANGUAGE', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.addLanguage({ language: 'English' });
        result.current.addLanguage({ language: 'Spanish' });
        result.current.removeLanguage(0);
      });

      expect(result.current.formData.languages.length).toBe(1);
      expect(result.current.formData.languages[0].language).toBe('Spanish');
    });
  });

  describe('State Persistence', () => {
    it('should preserve state across multiple updates', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', 'John Doe');
        result.current.setStep(2);
        result.current.addEducationEntry({ level: 'Bachelor' });
        result.current.setField('email', 'john@example.com');
      });

      expect(result.current.formData.fullName).toBe('John Doe');
      expect(result.current.currentStep).toBe(2);
      expect(result.current.formData.education.length).toBe(1);
      expect(result.current.formData.email).toBe('john@example.com');
    });

    it('should not lose data when updating unrelated fields', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', 'John Doe');
        result.current.addEducationEntry({ level: 'Bachelor' });
        result.current.setField('email', 'john@example.com');
      });

      expect(result.current.formData.fullName).toBe('John Doe');
      expect(result.current.formData.education.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays correctly', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      expect(result.current.formData.education).toEqual([]);
      expect(result.current.formData.experience).toEqual([]);
      expect(result.current.formData.computerSkills).toEqual([]);
      expect(result.current.formData.languages).toEqual([]);
    });

    it('should handle removing from empty array gracefully', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.removeEducationEntry(0);
      });

      expect(result.current.formData.education).toEqual([]);
    });

    it('should handle updating non-existent index gracefully', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setEducationEntry(5, { level: 'Master' });
      });

      expect(result.current.formData.education).toEqual([]);
    });

    it('should handle null and undefined values', () => {
      const { result } = renderHook(() => useApplicationForm(), { wrapper });

      act(() => {
        result.current.setField('fullName', null);
        result.current.setField('email', undefined);
      });

      expect(result.current.formData.fullName).toBe(null);
      expect(result.current.formData.email).toBe(undefined);
    });
  });

  describe('Action Creators Stability', () => {
    it('should maintain stable references for action creators', () => {
      const { result, rerender } = renderHook(() => useApplicationForm(), { wrapper });

      const initialSetField = result.current.setField;
      const initialSetStep = result.current.setStep;
      const initialAddFile = result.current.addFile;

      rerender();

      expect(result.current.setField).toBe(initialSetField);
      expect(result.current.setStep).toBe(initialSetStep);
      expect(result.current.addFile).toBe(initialAddFile);
    });
  });
});