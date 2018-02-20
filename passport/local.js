'use strict';

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user');

const localStrategy = new LocalStrategy((username, password, done) => {
  User.findOne({ username })
    .then(user => {
      if (!user) {
        console.log('Incorrect username');
        return done(null, false);
      }
      const isValid = user.validatePassword(password);
      if (!isValid) {
        console.log('Incorrect password');
        return done(null, false);
      }
      return done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

module.exports = localStrategy;