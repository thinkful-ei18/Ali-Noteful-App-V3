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
  const { searchTerm } = req.query;
  let filter = {};
  let projection = {};
  let sort = 'created'; // default sorting

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    projection.score = { $meta: 'textScore' };
    sort = projection;
  }
  
  Note
    .find(filter, projection)
    .select('title content created')
    .sort(sort)
    .then(notes => {
      res.json(notes);
    })
    .catch(next);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  Note
    .findById(req.params.id)
    .select('title content')
    .then(notes => {
      res.json(notes);
    })
    .catch(err => {
      console.error(err);
      res.status(400).json({ message: 'The `id` is not valid' });
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  //Check if required fields present
  const requiredFields = ['title', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      res.status(400).json({ message: `Missing \`${field}\` in request body` });
    }
  }
  
  Note
    .create({
      title: req.body.title,
      content: req.body.content,
    })
    .then(note => res.status(201).location(`${req.originalUrl}/${note.id}`).json(note.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    })
    .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Note
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(note => {
      res.status(204).json(note.serialize()).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }))
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  Note
    .findById(req.params.id)
    .then(() => {
      Note
        .findByIdAndRemove(req.params.id)
        .then(note => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
    })
    .catch(next);
});

module.exports = router;