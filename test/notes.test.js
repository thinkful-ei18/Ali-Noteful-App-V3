'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;

const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');

chai.use(chaiHttp);
chai.use(chaiSpies);

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
let seedNotes;




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
        seedNotes = [
          {
            '_id': '000000000000000000000000',
            'title': '5 life lessons learned from cats',
            'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'folderId': '111111111111111111111100',
            'tags': [
              '222222222222222222222200',
              '222222222222222222222201',
              '222222222222222222222202'
            ],
            'userId': id
          },
          {
            '_id': '000000000000000000000001',
            'title': 'What the government doesnt want you to know about cats',
            'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
            'folderId': '111111111111111111111101',
            'tags': [
              '222222222222222222222200',
              '222222222222222222222201',
              '222222222222222222222202'
            ],
            'userId': id
          },
          {
            '_id': '000000000000000000000002',
            'title': 'The most boring article about cats youll ever read',
            'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'folderId': '111111111111111111111102',
            'tags': [
              '222222222222222222222200',
              '222222222222222222222201',
              '222222222222222222222202'
            ],
            'userId': id
          },
          {
            '_id': '000000000000000000000003',
            'title': '7 things lady gaga has in common with cats',
            'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
            'folderId': '111111111111111111111102',
            'tags': [
              '222222222222222222222200',
              '222222222222222222222202'
            ],
            'userId': id
          },
          {
            '_id': '000000000000000000000004',
            'title': 'The most incredible article about cats youll ever read',
            'content': 'Lorem ipsum dolor sit amet, boring consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'userId': id
          },
          {
            '_id': '000000000000000000000005',
            'title': '10 ways cats can help you live to 100',
            'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
            'userId': id
          },
          {
            '_id': '000000000000000000000006',
            'title': '9 reasons you can blame the recession on cats',
            'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'userId': id
          },
          {
            '_id': '000000000000000000000007',
            'title': '10 ways marketers are making you addicted to cats',
            'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
            'userId': id
          }
        ];
      })
      .then(() => Note.insertMany(seedNotes))
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
      const apiPromise = chai
        .request(app)
        .get('/v3/notes')
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

    it('should find result by search term', function () {
      const search = 'way';
      return chai
        .request(app)
        .get(`/v3/notes/?searchTerm=${search}`)
        .set('Authorization', `Bearer ${token}`)
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
          return chai
            .request(app)
            .get(`/v3/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'tags', 'created');

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
      return chai
        .request(app)
        .post('/v3/notes')
        .send(newItem)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
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

    it('should return an error when missing invalid id for tags is provided', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': ['2222222222222222222222022'],
        'folderId': '111111111111111111111101'
      };
      const spy = chai.spy();
      return chai.request(app)
        .post('/v3/notes')
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
          expect(res.body.message).to.equal('2222222222222222222222022 is not a valid ID for a tag');
        });
    });

  });

  describe('GET /v3/notes', function () {
    it('should respond with a 400 for improperly formatted id', function () {
      const badId = '99-99-99';
      const spy = chai.spy();
      return chai
        .request(app)
        .get(`/v3/notes/${badId}`)
        .set('Authorization', `Bearer ${token}`)
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
        'folderId': '111111111111111111111101',
        'tags': ['222222222222222222222200']
      };
      return chai.request(app)
        .put('/v3/notes/000000000000000000000000')
        .send(updateItem)
        .set('Authorization', `Bearer ${token}`)
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
          expect(body.tags[0]).to.equal(`${data.tags[0]}`);
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
        .set('Authorization', `Bearer ${token}`)
        .catch(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.a('error');
          expect(res.response.body.message).to.equal(`Request path id (${id}) and request body id (${updateItem.id}) must match`);
        });
    });

    it('should return an error when missing invalid id for tags is provided', function () {
      const newItem = {
        'id': '000000000000000000000001',
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': ['2222222222222222222222022'],
        'folderId': '111111111111111111111101'
      };
      const id = '000000000000000000000001';
      return chai.request(app)
        .put(`/v3/notes/${id}`)
        .send(newItem)
        .set('Authorization', `Bearer ${token}`)
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('2222222222222222222222022 is not a valid ID for a tag');
        });
    });

  

  });

  describe('DELETE /v3/notes', function () {
    it('should permanently delete an item', function () {
      return chai.request(app)
        .delete('/v3/notes/000000000000000000000001')
        .set('Authorization', `Bearer ${token}`)
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






