/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['**/test/load/unit/**/*.unit.test.ts'],

  collectCoverage: true,
  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/services/index.ts',
  ],

  coverageReporters: ['text', 'lcov', 'json-summary'],

  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },

  clearMocks: true,
  restoreMocks: true,
};
