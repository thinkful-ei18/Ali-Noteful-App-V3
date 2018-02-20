'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, index: true},
  username: { type: String, unique: true},
  password: { type: String}
});

UserSchema.index({ name: 'text' });



UserSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

UserSchema.methods.validatePassword = function (password) {
  return (password === this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;