'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const User = require('../models/user');

const jwt = require('jsonwebtoken');
chai.use(chaiHttp);

const fullname = 'Example User';
const username = 'exampleUser';
const password = 'examplePass';
let token;

const { JWT_SECRET } = require('../config');

describe('Before and After hooks', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function () {
    return User.hashPassword(password)
      .then(password => User.create({ username, password, fullname }));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('User check', function () {

    it('Should return a valid auth token', function () {
      return chai.request(app)
        .post('/v3/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, { algorithm: ['HS256'] });
          expect(payload.user).to.have.keys('id', 'username', 'fullname');
        });
    });

  });

});



