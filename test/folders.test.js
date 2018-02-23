'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;

const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const Folder = require('../models/folder');

const User = require('../models/user');

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

chai.use(chaiHttp);
chai.use(chaiSpies);

const fullname = 'Example User';
const username = 'exampleUser';
const password = 'examplePass';
let id;
let token;
let seedFolders;





describe('Before and After hooks', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function () {
    return User
      .hashPassword(password)
      .then(digest => User.create({ username, password: digest, fullname }))
      .then(user => {
        id = user.id;
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
        seedFolders = [
          {
            '_id': '111111111111111111111100',
            'name': 'Archive',
            'userId': id
          },
          {
            '_id': '111111111111111111111101',
            'name': 'Drafts',
            'userId': id
          },
          {
            '_id': '111111111111111111111102',
            'name': 'Personal',
            'userId': id
          },
          {
            '_id': '111111111111111111111103',
            'name': 'Work',
            'userId': id
          }
        ];
      })
      .then(() => Folder.insertMany(seedFolders))
      .then(() => Folder.ensureIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  

  describe('GET /v3/folders', function () {

    it('should return the correct number of Folders', function () {
      // 1) Call the database and the API
      const dbPromise = Folder.find();
      const apiPromise = chai.request(app)
        .get('/v3/Folders')
        .set('Authorization', `Bearer ${token}`);

      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([dbPromise, apiPromise])
        // 3) **then** compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });


  });

  describe('GET /v3/folders/:id', function () {

    it('should return correct folders by id', function () {
      let data;
      // 1) First, call the database
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai
            .request(app)
            .get(`/v3/Folders/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'userId');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should return a message and error status 400 if id does not match mongoId', function () {
      return chai
        .request(app)
        .get('/v3/folders/1111111111111111111111000')
        .set('Authorization', `Bearer ${token}`)
        .catch(err => {
          const res = err.response; 
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('1111111111111111111111000 is not a valid ID');
        });
    });

    it('should return a 404 error is id is not valid', function () {
      return chai
        .request(app)
        .get('/v3/folders/111111111111111111111109')
        .set('Authorization', `Bearer ${token}`)
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('111111111111111111111109 is not a valid ID');
        });
    });
  });

  describe('POST /v3/folders', function () {
    it('should create and return a new folder when provided with valid data', function () {
      const newItem = {
        'name': 'The best article about cats ever!',
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/v3/folders')
        .send(newItem)
        .set('Authorization', `Bearer ${token}`)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'name');
          // 2) **then** call the database
          return Folder.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {
        'named': 'bar'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/folders')
        .send(newItem)
        .set('Authorization', `Bearer ${token}`)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when "name" field is not unique', function () {
      const newItem = {
        'name': 'Drafts'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/folders')
        .send(newItem)
        .set('Authorization', `Bearer ${token}`)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });

  });

  describe('PUT /v3/Folders/:id', function () {
    it('should update the folder name', function () {
      let body;
      const updateItem = {
        'id': '111111111111111111111100',
        'name': 'Canada'
      };
      return chai.request(app)
        .put('/v3/Folders/111111111111111111111100')
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          return Folder.findById(body.id);
        })
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when not provided with a matching id', function () {
      const updateItem = {
        'id': '111111111111111111111101',
        'name': 'Something'
      };
      const id = '1111111111111111111111011';
      return chai.request(app)
        .put(`/v3/Folders/${id}`)
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('1111111111111111111111011 is not a valid ID');
        });
    });

    it('should return an error when ids are not matching', function () {
      const updateItem = {
        'id': '111111111111111111111102',
        'name': 'Something'
      };
      const id = '111111111111111111111101';
      return chai.request(app)
        .put(`/v3/Folders/${id}`)
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Params id and body id must match');
        });
    });

    it('should return an error when name is missing', function () {
      const updateItem = {
        'id': '111111111111111111111101',
      };
      const id = '111111111111111111111101';
      return chai.request(app)
        .put(`/v3/Folders/${id}`)
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Name must be present in body');
        });
    });

    it('should return an error when name is missing', function () {
      const updateItem = {
        'id': '111111111111111111111101',
        'name': 'Archive'
      };
      const id = '111111111111111111111101';
      return chai.request(app)
        .put(`/v3/Folders/${id}`)
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });

  });
 
  describe('DELETE /v3/Folders', function () {
    it('should permanently delete an item', function () {
      return chai.request(app)
        .delete('/v3/Folders/111111111111111111111101')
        .set('Authorization', `Bearer ${token}`)
        .then(function (res) {
          expect(res).to.have.status(204);
          return Folder.findById('111111111111111111111101');
        })
        .then(data => {
          expect(data).to.be.null;
        });
    });
  });

});




