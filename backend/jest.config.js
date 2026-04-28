module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: './tsconfig.test.json' },
    ],
  },
};