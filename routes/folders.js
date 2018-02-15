'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Folder = require('../models/folder');


/* ========== GET/READ ALL ITEM ========== */
router.get('/folders', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};
  let projection = {};
  let sort = 'created'; // default sorting

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    projection.score = { $meta: 'textScore' };
    sort = projection;
  }

  Folder
    .find(filter, projection)
    .select('name id')
    .sort(sort)
    .then(folders => {
      res.json(folders);
    })
    .catch(next);
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/folders/:id', (req, res, next) => {
  Folder
    .findById(req.params.id)
    .select('name id')
    .then(folders => {
      res.json(folders);
    })
    .catch(err => {
      res.status(404).json({ message: 'The `id` is not valid', status: 404 });
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
    .findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .select('title content id')
    .then(note => {
      res.json(note);
    })
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  Note
    .findById(req.params.id)
    .then(() => {
      Note
        .findByIdAndRemove(req.params.id)
        .then(note => res.status(204).end());
    })
    .catch(next);
});

module.exports = router;