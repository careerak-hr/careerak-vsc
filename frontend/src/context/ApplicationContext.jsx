import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Action Types
export const ACTION_TYPES = {
  SET_FIELD: 'SET_FIELD',
  SET_STEP: 'SET_STEP',
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  SET_ERRORS: 'SET_ERRORS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  SET_DRAFT_ID: 'SET_DRAFT_ID',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  LOAD_DRAFT: 'LOAD_DRAFT',
  RESET_FORM: 'RESET_FORM',
  SET_CUSTOM_ANSWER: 'SET_CUSTOM_ANSWER',
  SET_EDUCATION_ENTRY: 'SET_EDUCATION_ENTRY',
  ADD_EDUCATION_ENTRY: 'ADD_EDUCATION_ENTRY',
  REMOVE_EDUCATION_ENTRY: 'REMOVE_EDUCATION_ENTRY',
  SET_EXPERIENCE_ENTRY: 'SET_EXPERIENCE_ENTRY',
  ADD_EXPERIENCE_ENTRY: 'ADD_EXPERIENCE_ENTRY',
  REMOVE_EXPERIENCE_ENTRY: 'REMOVE_EXPERIENCE_ENTRY',
  SET_SKILL: 'SET_SKILL',
  ADD_SKILL: 'ADD_SKILL',
  REMOVE_SKILL: 'REMOVE_SKILL',
  SET_LANGUAGE: 'SET_LANGUAGE',
  ADD_LANGUAGE: 'ADD_LANGUAGE',
  REMOVE_LANGUAGE: 'REMOVE_LANGUAGE',
};

// Initial State
const initialState = {
  currentStep: 1,
  isDraft: false,
  draftId: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  errors: {},
  formData: {
    // Step 1: Personal Information
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    
    // Step 2: Education & Experience
    education: [],
    experience: [],
    
    // Step 3: Skills & Languages
    computerSkills: [],
    softwareSkills: [],
    otherSkills: [],
    languages: [],
    
    // Step 4: Documents & Custom Questions
    files: [],
    customAnswers: {},
    
    // Additional fields
    coverLetter: '',
    expectedSalary: '',
    availableFrom: '',
    noticePeriod: '',
  },
};

// Reducer Function
function applicationReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
      };

    case ACTION_TYPES.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };

    case ACTION_TYPES.SET_FILES:
      return {
        ...state,
        formData: {
          ...state.formData,
          files: action.payload,
        },
      };

    case ACTION_TYPES.ADD_FILE:
      return {
        ...state,
        formData: {
          ...state.formData,
          files: [...state.formData.files, action.payload],
        },
      };

    case ACTION_TYPES.REMOVE_FILE:
      return {
        ...state,
        formData: {
          ...state.formData,
          files: state.formData.files.filter(file => file.id !== action.payload),
        },
      };

    case ACTION_TYPES.SET_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
      };

    case ACTION_TYPES.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors,
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ACTION_TYPES.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload,
      };

    case ACTION_TYPES.SET_DRAFT_ID:
      return {
        ...state,
        draftId: action.payload,
        isDraft: !!action.payload,
      };

    case ACTION_TYPES.SET_LAST_SAVED:
      return {
        ...state,
        lastSaved: action.payload,
      };

    case ACTION_TYPES.LOAD_DRAFT:
      return {
        ...state,
        ...action.payload,
        isDraft: true,
      };

    case ACTION_TYPES.RESET_FORM:
      return {
        ...initialState,
        formData: {
          ...initialState.formData,
          ...action.payload, // Allow partial reset with new data
        },
      };

    case ACTION_TYPES.SET_CUSTOM_ANSWER:
      return {
        ...state,
        formData: {
          ...state.formData,
          customAnswers: {
            ...state.formData.customAnswers,
            [action.payload.questionId]: action.payload.answer,
          },
        },
      };

    case ACTION_TYPES.SET_EDUCATION_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          education: state.formData.education.map((entry, index) =>
            index === action.payload.index ? { ...entry, ...action.payload.data } : entry
          ),
        },
      };

    case ACTION_TYPES.ADD_EDUCATION_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          education: [...state.formData.education, action.payload],
        },
      };

    case ACTION_TYPES.REMOVE_EDUCATION_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          education: state.formData.education.filter((_, index) => index !== action.payload),
        },
      };

    case ACTION_TYPES.SET_EXPERIENCE_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          experience: state.formData.experience.map((entry, index) =>
            index === action.payload.index ? { ...entry, ...action.payload.data } : entry
          ),
        },
      };

    case ACTION_TYPES.ADD_EXPERIENCE_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          experience: [...state.formData.experience, action.payload],
        },
      };

    case ACTION_TYPES.REMOVE_EXPERIENCE_ENTRY:
      return {
        ...state,
        formData: {
          ...state.formData,
          experience: state.formData.experience.filter((_, index) => index !== action.payload),
        },
      };

    case ACTION_TYPES.SET_SKILL:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.category]: state.formData[action.payload.category].map((skill, index) =>
            index === action.payload.index ? action.payload.data : skill
          ),
        },
      };

    case ACTION_TYPES.ADD_SKILL:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.category]: [...state.formData[action.payload.category], action.payload.data],
        },
      };

    case ACTION_TYPES.REMOVE_SKILL:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.category]: state.formData[action.payload.category].filter(
            (_, index) => index !== action.payload.index
          ),
        },
      };

    case ACTION_TYPES.SET_LANGUAGE:
      return {
        ...state,
        formData: {
          ...state.formData,
          languages: state.formData.languages.map((lang, index) =>
            index === action.payload.index ? action.payload.data : lang
          ),
        },
      };

    case ACTION_TYPES.ADD_LANGUAGE:
      return {
        ...state,
        formData: {
          ...state.formData,
          languages: [...state.formData.languages, action.payload],
        },
      };

    case ACTION_TYPES.REMOVE_LANGUAGE:
      return {
        ...state,
        formData: {
          ...state.formData,
          languages: state.formData.languages.filter((_, index) => index !== action.payload),
        },
      };

    default:
      return state;
  }
}

// Create Context
const ApplicationContext = createContext(null);

// Provider Component
export function ApplicationProvider({ children, jobPostingId }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  // Action Creators
  const setField = useCallback((field, value) => {
    dispatch({ type: ACTION_TYPES.SET_FIELD, payload: { field, value } });
  }, []);

  const setStep = useCallback((step) => {
    dispatch({ type: ACTION_TYPES.SET_STEP, payload: step });
  }, []);

  const setFiles = useCallback((files) => {
    dispatch({ type: ACTION_TYPES.SET_FILES, payload: files });
  }, []);

  const addFile = useCallback((file) => {
    dispatch({ type: ACTION_TYPES.ADD_FILE, payload: file });
  }, []);

  const removeFile = useCallback((fileId) => {
    dispatch({ type: ACTION_TYPES.REMOVE_FILE, payload: fileId });
  }, []);

  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTION_TYPES.SET_ERRORS, payload: errors });
  }, []);

  const setError = useCallback((field, message) => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: { field, message } });
  }, []);

  const clearError = useCallback((field) => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR, payload: field });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
  }, []);

  const setSaving = useCallback((saving) => {
    dispatch({ type: ACTION_TYPES.SET_SAVING, payload: saving });
  }, []);

  const setDraftId = useCallback((draftId) => {
    dispatch({ type: ACTION_TYPES.SET_DRAFT_ID, payload: draftId });
  }, []);

  const setLastSaved = useCallback((timestamp) => {
    dispatch({ type: ACTION_TYPES.SET_LAST_SAVED, payload: timestamp });
  }, []);

  const loadDraft = useCallback((draftData) => {
    dispatch({ type: ACTION_TYPES.LOAD_DRAFT, payload: draftData });
  }, []);

  const resetForm = useCallback((newData = {}) => {
    dispatch({ type: ACTION_TYPES.RESET_FORM, payload: newData });
  }, []);

  const setCustomAnswer = useCallback((questionId, answer) => {
    dispatch({ type: ACTION_TYPES.SET_CUSTOM_ANSWER, payload: { questionId, answer } });
  }, []);

  // Education actions
  const setEducationEntry = useCallback((index, data) => {
    dispatch({ type: ACTION_TYPES.SET_EDUCATION_ENTRY, payload: { index, data } });
  }, []);

  const addEducationEntry = useCallback((entry = {}) => {
    dispatch({ type: ACTION_TYPES.ADD_EDUCATION_ENTRY, payload: entry });
  }, []);

  const removeEducationEntry = useCallback((index) => {
    dispatch({ type: ACTION_TYPES.REMOVE_EDUCATION_ENTRY, payload: index });
  }, []);

  // Experience actions
  const setExperienceEntry = useCallback((index, data) => {
    dispatch({ type: ACTION_TYPES.SET_EXPERIENCE_ENTRY, payload: { index, data } });
  }, []);

  const addExperienceEntry = useCallback((entry = {}) => {
    dispatch({ type: ACTION_TYPES.ADD_EXPERIENCE_ENTRY, payload: entry });
  }, []);

  const removeExperienceEntry = useCallback((index) => {
    dispatch({ type: ACTION_TYPES.REMOVE_EXPERIENCE_ENTRY, payload: index });
  }, []);

  // Skill actions
  const setSkill = useCallback((category, index, data) => {
    dispatch({ type: ACTION_TYPES.SET_SKILL, payload: { category, index, data } });
  }, []);

  const addSkill = useCallback((category, data) => {
    dispatch({ type: ACTION_TYPES.ADD_SKILL, payload: { category, data } });
  }, []);

  const removeSkill = useCallback((category, index) => {
    dispatch({ type: ACTION_TYPES.REMOVE_SKILL, payload: { category, index } });
  }, []);

  // Language actions
  const setLanguage = useCallback((index, data) => {
    dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: { index, data } });
  }, []);

  const addLanguage = useCallback((data) => {
    dispatch({ type: ACTION_TYPES.ADD_LANGUAGE, payload: data });
  }, []);

  const removeLanguage = useCallback((index) => {
    dispatch({ type: ACTION_TYPES.REMOVE_LANGUAGE, payload: index });
  }, []);

  const value = {
    // State
    ...state,
    jobPostingId,
    
    // Actions
    setField,
    setStep,
    setFiles,
    addFile,
    removeFile,
    setErrors,
    setError,
    clearError,
    setLoading,
    setSaving,
    setDraftId,
    setLastSaved,
    loadDraft,
    resetForm,
    setCustomAnswer,
    
    // Education actions
    setEducationEntry,
    addEducationEntry,
    removeEducationEntry,
    
    // Experience actions
    setExperienceEntry,
    addExperienceEntry,
    removeExperienceEntry,
    
    // Skill actions
    setSkill,
    addSkill,
    removeSkill,
    
    // Language actions
    setLanguage,
    addLanguage,
    removeLanguage,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Custom Hook to use Application Context
export function useApplicationForm() {
  const context = useContext(ApplicationContext);
  
  if (!context) {
    throw new Error('useApplicationForm must be used within an ApplicationProvider');
  }
  
  return context;
}

export default ApplicationContext;
