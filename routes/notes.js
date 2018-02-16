'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Note = require('../models/note');


/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {   
  const { searchTerm, folderId  } = req.query;

  let filter = (folderId) ? { folderId} : {};
  let projection = {};
  let sort = 'created'; 

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    projection.score = { $meta: 'textScore' };
    sort = projection;
  }

  Note
    .find(filter, projection)
    .populate({path: 'tags', select: 'id'})
    .select('title content created folderId tags')
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
    .populate({path: 'tags', select: 'id'})
    .select('title content folderId tags')
    .then(notes => {
      res.json(notes);
    })
    .catch(err => {
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
      res.status(400).json({ message: `Missing \`${field}\` in request body` });
    }
  }

  let obj = {
    title: req.body.title,
    content: req.body.content,
    tags: (req.body.tags) ? req.body.tags : []
  };

  obj.tags.forEach(val => {
    if (!mongoose.Types.ObjectId.isValid(val)) {
      const err = new Error(`${val} is not a valid ID for a tag`);
      err.status = 400;
      return next(err);
    }
  });

  (req.body.folderId) ? obj.folderId = req.body.folderId : obj;

  Note
    .create(obj)
    .then(note => res.status(201).location(`${req.originalUrl}/${note.id}`).json(note))
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
  const updateableFields = ['title', 'content', 'tags'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  (req.body.folderId) ? toUpdate.folderId = req.body.folderId : toUpdate;

  toUpdate.tags.forEach(val => {
    if (!mongoose.Types.ObjectId.isValid(val)) {
      const err = new Error(`${val} is not a valid ID for a tag`);
      err.status = 400;
      return next(err);
    }
  });

  Note
    .findByIdAndUpdate(req.params.id, { $set: toUpdate }, {new: true})
    .select('title content id folderId tags')
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