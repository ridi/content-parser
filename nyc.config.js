module.exports = {
  cache: false,
  'check-coverage': true,
  'per-file': false,
  require: ['esm'],
  'report-dir': 'coverage',
  reporter: [
    'lcov',
    'json',
    'text-summary',
  ],
  'temp-directory': 'coverage/.nyc_output',
  branches: 95,
  functions: 95,
  lines: 95,
  statements: 95,
  include: ['**/src/**/*.js'],
  exclude: [
    '**/lib/**/*.js',
    '**/test/**/*.js',
  ],
};
