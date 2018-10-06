const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  `postgres://localhost/${process.env.DATABASE_NAME}`,
  {
    // dialect: 'postgres'
    logging: false
  },
);

const models = {
  User: sequelize.import('./user'),
  Message: sequelize.import('./message')
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
});

module.exports = {
  models,
  sequelize
}
