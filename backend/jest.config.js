module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // Increased for property-based tests
  verbose: true,
  // Run tests serially to prevent MongoDB collection clearing (beforeEach in setup.js)
  // from interfering between parallel test workers sharing the same database
  maxWorkers: 1,
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};