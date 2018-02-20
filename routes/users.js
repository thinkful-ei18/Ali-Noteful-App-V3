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

  User
    .create(req.body)
    .then(user => res.status(201).location(`${req.originalUrl}${user.id}`).json(user))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});




module.exports = router;