/** @type {import('jest').Config} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/unit/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.test.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/test/load/'],

  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/data/**',
    '!src/utils/logger.ts',
    '!src/test/**',
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
