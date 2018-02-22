'use strict';

// exports.PORT = process.env.PORT || 8080;
// exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/noteful-app';
// exports.TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost/noteful-app-test';
// exports.JWT_SECRET = process.env.JWT_SECRET;
// exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/noteful-app',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/noteful-app-test',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};