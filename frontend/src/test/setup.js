/**
 * Vitest Test Setup
 * 
 * This file is run before all tests to set up the testing environment.
 * Updated with comprehensive mocks to fix bulk test failures.
 */

import { expect, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Setup mocks
beforeAll(() => {
  // Mock MutationObserver for react-helmet-async
  global.MutationObserver = class {
    constructor(callback) { this.callback = callback; }
    disconnect() {}
    observe(element) { this.callback([{ type: 'childList', target: element }], this); }
    takeRecords() { return []; }
  };
  
  if (!document.head) {
    document.head = document.createElement('head');
    document.documentElement.appendChild(document.head);
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(),
    remove: vi.fn().mockResolvedValue(),
    clear: vi.fn().mockResolvedValue(),
    keys: vi.fn().mockResolvedValue({ keys: [] }),
  },
}));

// Mock Framer Motion - Disable animations for consistent testing
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })),
      section: React.forwardRef((props, ref) => React.createElement('section', { ...props, ref })),
      button: React.forwardRef((props, ref) => React.createElement('button', { ...props, ref })),
      span: React.forwardRef((props, ref) => React.createElement('span', { ...props, ref })),
      article: React.forwardRef((props, ref) => React.createElement('article', { ...props, ref })),
      header: React.forwardRef((props, ref) => React.createElement('header', { ...props, ref })),
      p: React.forwardRef((props, ref) => React.createElement('p', { ...props, ref })),
      img: React.forwardRef((props, ref) => React.createElement('img', { ...props, ref })),
      nav: React.forwardRef((props, ref) => React.createElement('nav', { ...props, ref })),
      aside: React.forwardRef((props, ref) => React.createElement('aside', { ...props, ref })),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useInView: () => [vi.fn(), true],
  };
});

// Mock Lucide Icons to avoid rendering complexity
vi.mock('lucide-react', () => {
  const React = require('react');
  const createIcon = (name) => React.forwardRef((props, ref) => 
    React.createElement('span', { 'data-testid': `icon-${name}`, ...props, ref })
  );
  
  return {
    Heart: createIcon('heart'),
    Share: createIcon('share'),
    MapPin: createIcon('map-pin'),
    Briefcase: createIcon('briefcase'),
    DollarSign: createIcon('dollar'),
    Clock: createIcon('clock'),
    Users: createIcon('users'),
    TrendingUp: createIcon('trending-up'),
    Search: createIcon('search'),
    Plus: createIcon('plus'),
    Trash2: createIcon('trash'),
    Edit2: createIcon('edit'),
    FileText: createIcon('file-text'),
    ExternalLink: createIcon('external-link'),
    ChevronLeft: createIcon('chevron-left'),
    ChevronDown: createIcon('chevron-down'),
    CheckCircle2: createIcon('check-circle'),
    AlertCircle: createIcon('alert-circle'),
    Eye: createIcon('eye'),
    Layers: createIcon('layers'),
    Grid: createIcon('grid'),
    List: createIcon('list'),
    Lightbulb: createIcon('lightbulb'),
    Sparkles: createIcon('sparkles'),
    Award: createIcon('award'),
    BarChart3: createIcon('bar-chart'),
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

// Mock Service Worker
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: vi.fn().mockResolvedValue({}),
      ready: Promise.resolve({
        active: { postMessage: vi.fn() },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      controller: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getRegistration: vi.fn().mockResolvedValue(null),
      getRegistrations: vi.fn().mockResolvedValue([]),
    },
  });
}
