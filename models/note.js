'use strict';

const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  title: String,
  content: String,
  create: Date.now
});

const Note = mongoose.model('Note', noteSchema);

module.exports = {Note};