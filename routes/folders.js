'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Folder = require('../models/folder');
const Note = require('../models/note');


/* ========== GET/READ ALL ITEM ========== */
router.get('/folders', (req, res, next) => {
  const userId = req.user.id;
  let filter = {userId};
  let projection = {};
  let sort = 'created'; // default sorting

  Folder
    .find(filter, projection)
    .select('name id userId')
    .sort(sort)
    .then(folders => {
      res.json(folders);
    })
    .catch(next);
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/folders/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error(`${req.params.id} is not a valid ID`);
    err.status = 400;
    return next(err);
  }


  Folder
    .findOne({ _id: id, userId })
    .select('name id userId')
    .then(folders => {
      if (folders) {
        res.json(folders);
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
router.post('/folders', (req, res, next) => {

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
  
  Folder
    .create({
      name: req.body.name,
      userId: req.user.id
    })
    .then(folder => res.status(201).location(`${req.originalUrl}${folder.id}`).json(folder))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/folders/:id', (req, res, next) => {
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

  Folder
    .findOneAndUpdate({ _id: id, userId }, toUpdate, { new: true })
    .then(folder => res.json(folder))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/folders/:id', (req, res, next) => {

// // THIS SETS NOTE FOLDERID TO NULL
//   Folder
//     .findByIdAndRemove(req.params.id)
//     .then(() => {
//       return  Note
//         .update({ folderId: req.params.id }, { $set: { folderId: null } }, {multi: true});
//     })
//     .then(() => res.status(204).end())
//     .catch(next);

  Note
    .find({folderId : req.params.id, userId : req.user.id})
    .then((res) => {
      if(res.length > 0) {
        const err = new Error('Folder is being used by other notes');
        err.status = 400;
        return next(err);
      }
    })
    .then(() => {
      return Folder
        .findByIdAndRemove(req.params.id);
    })
    .then(() => res.status(204).end())
    .catch(next);


});

module.exports = router;