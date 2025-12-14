/** @type {import('jest').Config} */

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.spec.ts'],

  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/data/**',
    '!src/utils/logger.ts',
  ],

  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = config;
