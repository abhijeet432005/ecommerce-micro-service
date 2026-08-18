/**
 * Jest configuration for Cart service
 */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.js', '!src/db/**'],
    moduleFileExtensions: ['js', 'json'],
    setupFilesAfterEnv: ['<rootDir>/test/setup/globalSetup.js']
};