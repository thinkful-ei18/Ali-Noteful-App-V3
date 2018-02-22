'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, index: true},
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

folderSchema.index({ name: 'text'});
folderSchema.index({ name: 1, userId: 1 }, { unique: true });



folderSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;