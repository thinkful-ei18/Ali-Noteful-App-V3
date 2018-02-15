'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;

const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

chai.use(chaiHttp);
chai.use(chaiSpies);





describe('Before and After hooks', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.ensureIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });



  describe('GET /v3/notes', function () {

    it('should return the correct number of Notes', function () {
      // 1) Call the database and the API
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/v3/notes');

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

    it('should find result by search term', function () {
      const search = 'way';
      return chai.request(app)
        .get(`/v3/notes/?searchTerm=${search}`)
        .then( res => {
          expect(res.body).to.have.length(2);
        });
    });
    
      
  });

  describe('GET /v3/notes/:id', function () {

    it('should return correct notes', function () {
      let data;
      // 1) First, call the database
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai.request(app).get(`/v3/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
  });

  describe('POST /v3/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': [],
        'folderId': '111111111111111111111101'
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/v3/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content', 'folderId');
          // 2) **then** call the database
          return Note.findById(body.id);
        })
        // 3) **then** compare
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });

    it('should return an error when missing "title" field', function () {
      const newItem = {
        'content': 'bar'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/notes')
        .send(newItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('GET /v3/notes', function () {
    it('should respond with a 400 for improperly formatted id', function () {
      const badId = '99-99-99';
      const spy = chai.spy();
      return chai.request(app).get(`/v3/notes/${badId}`)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
  });

  describe('PUT /v3/notes/:id', function () {
    
    it('should update the note', function () {
      let body;
      const updateItem = {
        'id': '000000000000000000000000',
        'title': 'What about dogs?!',
        'content': 'woof woof',
        'folderId': '111111111111111111111101'
      };
      return chai.request(app)
        .put('/v3/notes/000000000000000000000000')
        .send(updateItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folderId');
          return Note.findById(body.id);
        })
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when not provided with a matching id', function () {
      const updateItem = {
        'id': '000000000000000000000001',
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      const id = '000000000000000000000000';
      return chai.request(app)
        .put(`/v3/notes/${id}`)
        .send(updateItem)
        .catch(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.a('error');
          expect(res.response.body.message).to.equal(`Request path id (${id}) and request body id (${updateItem.id}) must match`);
        });
    });


  

  });

  describe('DELETE /v3/notes', function () {
    it('should permanently delete an item', function () {
      return chai.request(app)
        .delete('/v3/notes/000000000000000000000001')
        .then(function (res) {
          expect(res).to.have.status(204);
          return Note.findById('000000000000000000000001');
        })
        .then(data => {
          expect(data).to.be.null;
        });
    });


  });

});






