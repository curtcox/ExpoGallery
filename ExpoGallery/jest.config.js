/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        jsx: 'react'
      }
    }],
    '^.+\\.jsx?$': ['babel-jest', {
      presets: ['babel-preset-expo']
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(stemmer|double-metaphone|@teovilla/react-native-web-maps|react-native|expo-.*|@expo.*|@react-native.*)/)'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': 'react-native-web',
    '^react-native/Libraries/Utilities/Platform$': '<rootDir>/node_modules/react-native-web/dist/exports/Platform'
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/jest.setup.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/dist/'
  ],
  globals: {
    __DEV__: true
  }
};