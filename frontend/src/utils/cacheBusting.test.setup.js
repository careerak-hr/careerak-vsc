import { vi } from 'vitest';

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
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    // Add this to make Object.keys work
    [Symbol.iterator]: function* () {
      for (const key of Object.keys(store)) {
        yield key;
      }
    },
    keys: function() {
      return Object.keys(store);
    }
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
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
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Mock caches API
const cachesMock = {
  keys: vi.fn(() => Promise.resolve(['cache-v1', 'cache-v2'])),
  delete: vi.fn((cacheName) => Promise.resolve(true)),
  open: vi.fn(() => Promise.resolve({
    match: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
};

// Assign mocks to global
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;
global.caches = cachesMock;

// Mock window.location
delete global.window;
global.window = {
  location: {
    reload: vi.fn(),
  },
};

// Mock document
global.document = {
  createElement: vi.fn(() => ({
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
  })),
  head: {
    appendChild: vi.fn(),
  },
};
