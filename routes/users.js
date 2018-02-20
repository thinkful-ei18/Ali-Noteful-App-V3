'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');


/* ========== POST/CREATE AN ITEM ========== */
router.post('/users', (req, res, next) => {
  //Check if required fields present
  const requiredFields = ['username', 'fullname', 'password'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const err = new Error(`Missing \`${field}\` in request body`);
      err.status = 400;
      return next(err);
    }
  }

  // User
  //   .create(req.body)
  //   .then(user => res.status(201).location(`${req.originalUrl}${user.id}`).json(user))
  //   .catch(err => {
  //     if (err.code === 11000) {
  //       err = new Error('The Tag name already exists');
  //       err.status = 400;
  //     }
  //     next(err);
  //   });

  return User.hashPassword(req.body.password)
    .then(digest => {
      const newUser = {
        username: req.body.username,
        password: digest,
        fullname: req.body.fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/v3/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});




module.exports = router;