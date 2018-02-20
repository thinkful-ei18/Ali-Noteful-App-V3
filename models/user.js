'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, index: true},
  username: { type: String, unique: true},
  password: { type: String}
});

userSchema.index({ name: 'text' });



userSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;