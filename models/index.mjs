import sequelizePackage from 'sequelize';
import allConfig from '../config/config.js';

import initTripModel from './trip.mjs';
import initAttractionModel from './attraction.mjs';

const { Sequelize } = sequelizePackage;
const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.Trip = initTripModel(sequelize, Sequelize.DataTypes);
db.Attraction = initAttractionModel(sequelize, Sequelize.DataTypes);

// The following 2 lines enable Sequelize to recognise the 1-M relationship
// between Item and Category models, providing the mixin association methods.
db.Attraction.belongsTo(db.Trip);
db.Trip.hasMany(db.Attraction);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

if (process.argv[2] === 'create') {
  db.Trip.create({ name: process.argv[3] }).then((returnedTrip) => {
    console.log('success!!');
    console.log(returnedTrip.id, 'returned trip ID');
  })
    .catch((error) => {
      console.log(error);
    });
}

if (process.argv[2] === 'add-attrac') {
  db.Trip.findOne({
    where: {
      name: process.argv[3],
    },
  })
    .then((returnedTrip) => db.Attraction.create({
      name: process.argv[4],
      tripId: returnedTrip.id,
    }))
    .then((returnedAttraction) => {
      console.log('success!!');
      console.log(returnedAttraction.id, 'returned attraction ID');
      console.log(returnedAttraction.tripId, 'returned attraction\'s trip ID');
    })
    .catch((error) => {
      console.log(error);
    }); }

if (process.argv[2] === 'trip') {
  db.Trip.findOne({
    where: {
      name: [process.argv[3]],
    },
  })
  // When we omit curly braces in arrow functions, the return keyword is implied.
    .then((trip) => trip.getAttractions())
    .then((tripAttractions) => console.log(tripAttractions.map((tripAttraction) => tripAttraction.name)))
    .catch((error) => console.log(error));
}
