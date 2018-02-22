'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Note = require('../models/note');


/* ========== GET/READ ALL ITEM ========== */
router.get('/Tags', (req, res, next) => {
  const userId = req.user.id;
  const { searchTerm } = req.query;
  let filter = {userId};
  let projection = {};
  let sort = 'created'; // default sorting

  Tag
    .find(filter, projection)
    .select('name id')
    .sort(sort)
    .then(Tags => {
      res.json(Tags);
    })
    .catch(next);
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/Tags/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error(`${req.params.id} is not a valid ID`);
    err.status = 400;
    return next(err);
  }


  Tag
    .findOne({ _id: id, userId })
    .select('name id userId')
    .then(Tags => {
      if (Tags) {
        res.json(Tags);
      }
      else {
        const err = new Error(`${req.params.id} is not a valid ID`);
        err.status = 404;
        return next(err);
      }
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/Tags', (req, res, next) => {
  //Check if required fields present
  const requiredFields = ['name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const err = new Error(`Missing \`${field}\` in request body`);
      err.status = 400;
      return next(err);
    }
  }

  Tag
    .create({
      name: req.body.name,
      userId: req.user.id
    })
    .then(Tag => res.status(201).location(`${req.originalUrl}${Tag.id}`).json(Tag))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/Tags/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error(`${req.params.id} is not a valid ID`);
    err.status = 400;
    return next(err);
  }

  if (req.params.id !== req.body.id) {
    const err = new Error('Params id and body id must match');
    err.status = 400;
    return next(err);
  }

  if (!req.body.name) {
    const err = new Error('Name must be present in body');
    err.status = 400;
    return next(err);
  }
  const toUpdate = {
    name: req.body.name,
  };

  Tag
    .findOneAndUpdate({ _id: id, userId }, toUpdate, { new: true })
    .then(Tag => Tag ? res.json(Tag) : next(Tag))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/Tags/:id', (req, res, next) => {

  Tag
    .findOneAndRemove({ _id: req.params.id, userId: req.user.id })
    .then(() => {
      return  Note
        .update({},
          { $pull: { tags: req.params.id} },
          { multi: true }
        );
    })
    .then(() => res.status(204).end())
    .catch(next);
});

module.exports = router;