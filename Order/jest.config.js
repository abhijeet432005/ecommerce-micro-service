/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    setupFiles: ['<rootDir>/test/setup/env.js'],
    setupFilesAfterEnv: ['<rootDir>/test/setup/mongodb.js'],
    testTimeout: 10000,
    clearMocks: true,
};