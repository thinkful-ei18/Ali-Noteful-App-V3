'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;

const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const Tag = require('../models/tag');
const seedTags = require('../db/seed/tags');

chai.use(chaiHttp);
chai.use(chaiSpies);





describe('Before and After hooks', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function () {
    return Tag.insertMany(seedTags)
      .then(() => Tag.ensureIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });



  describe('GET /v3/Tags', function () {

    it('should return the correct number of Tags', function () {
      // 1) Call the database and the API
      const dbPromise = Tag.find();
      const apiPromise = chai.request(app).get('/v3/Tags');

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

  describe('GET /v3/Tags/:id', function () {

    it('should return correct Tags by id', function () {
      let data;
      // 1) First, call the database
      return Tag.findOne().select('id name')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai.request(app).get(`/v3/Tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should return a message and error status 400 if id does not match mongoId', function () {
      return chai.request(app).get('/v3/Tags/1111111111111111111111000')
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('1111111111111111111111000 is not a valid ID');
        });
    });

    it('should return a 404 error is id is not valid', function () {
      return chai.request(app).get('/v3/Tags/111111111111111111111109')
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('111111111111111111111109 is not a valid ID');
        });
    });
  });

  describe('POST /v3/Tags', function () {
    it('should create and return a new Tag when provided with valid data', function () {
      const newItem = {
        'name': 'The best article about cats ever!',
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/v3/Tags')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'name');
          // 2) **then** call the database
          return Tag.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.name).to.equal(data.name);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {
        'named': 'bar'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/Tags')
        .send(newItem)
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
        'name': 'foo'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/Tags')
        .send(newItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The Tag name already exists');
        });
    });

  });

  describe('PUT /v3/Tags/:id', function () {
    it('should update the Tag name', function () {
      let body;
      const updateItem = {
        'id': '222222222222222222222200',
        'name': 'Canada'
      };
      return chai.request(app)
        .put('/v3/Tags/222222222222222222222200')
        .send(updateItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          return Tag.findById(body.id);
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
        .put(`/v3/Tags/${id}`)
        .send(updateItem)
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
        .put(`/v3/Tags/${id}`)
        .send(updateItem)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Params id and body id must match');
        });
    });

    it('should return an error when name is missing', function () {
      const updateItem = {
        'id': '222222222222222222222200',
      };
      const id = '222222222222222222222200';
      return chai.request(app)
        .put(`/v3/Tags/${id}`)
        .send(updateItem)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Name must be present in body');
        });
    });

    it('should return an error when name already exsists', function () {
      const updateItem = {
        'id': '222222222222222222222200',
        'name': 'bar'
      };
      const id = '222222222222222222222200';
      return chai.request(app)
        .put(`/v3/Tags/${id}`)
        .send(updateItem)
        .catch(function (err) {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The Tag name already exists');
        });
    });

  });

  describe('DELETE /v3/Tags', function () {
    it('should permanently delete an item', function () {
      return chai.request(app)
        .delete('/v3/Tags/222222222222222222222200')
        .then(function (res) {
          expect(res).to.have.status(204);
          return Tag.findById('222222222222222222222200');
        })
        .then(data => {
          expect(data).to.be.null;
        });
    });
  });

});



