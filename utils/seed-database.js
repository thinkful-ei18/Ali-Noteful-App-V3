'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/Folder');
const Tag = require('../models/tag');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(result => {
    console.info(`Dropped Database: ${result}`);
  })
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes)
        .then(results => {
          console.info(`Inserted ${results.length} Notes`);
        }),
      Folder.insertMany(seedFolders)
        .then(results => {
          console.info(`Inserted ${results.length} Folders`);
        }),
      Tag.insertMany(seedTags)
        .then(results => {
          console.info(`Inserted ${results.length} Tags`);
        }),
      Note.createIndexes(),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return mongoose.connection.db.dropDatabase()
//       .then(result => {
//         console.info(`Dropped Database: ${result}`);
//       });
//   })
//   .then(() => {
//     return Folder.insertMany(seedTags)
//       .then(results => {
//         console.info(`Inserted ${results.length} Seed`);
//       });
//   })
//   .then(() => {
//     return Folder.insertMany(seedFolders)
//       .then(results => {
//         console.info(`Inserted ${results.length} Folders`);
//       });
//   })
//   .then(() => {
//     return Note.insertMany(seedNotes)
//       .then(results => {
//         console.info(`Inserted ${results.length} Notes`);
//       });
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });