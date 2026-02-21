/**
 * Vitest Test Setup
 * 
 * This file is run before all tests to set up the testing environment.
 */

import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup react-helmet-async for testing
beforeAll(() => {
  // Create a MutationObserver mock for react-helmet-async
  global.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    disconnect() {}
    observe(element, initObject) {
      // Immediately trigger callback to simulate DOM changes
      this.callback([{ type: 'childList', target: element }], this);
    }
    takeRecords() {
      return [];
    }
  };
  
  // Ensure document.head exists and is mutable
  if (!document.head) {
    document.head = document.createElement('head');
    document.documentElement.appendChild(document.head);
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
