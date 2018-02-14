'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, index: true },
  content: String,
  created: { type: Date, default: Date.now },
});

noteSchema.index({ title: 'text', content: 'text' });

noteSchema.methods.serialize = function () {

  return {
    id: this._id,
    title: this.title,
    content: this.content
  };
};

noteSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;