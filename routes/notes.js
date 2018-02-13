'use strict';

const bodyParser = require('body-parser');
const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');


router.use(bodyParser.json());

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      Note
        .find()
        .then(notes => {
          res.json(notes);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
        });
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      Note
        .findById(req.params.id)
        .then(notes => {
          res.json(notes);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
        });
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2 });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 2 });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();

});

module.exports = router;