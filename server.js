const express = require('express')
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { models, sequelize } = require('./models');
const schema = require('./schema');
const resolvers = require('./resolvers');

const app = express();
app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  // formats error to remove standard text
  formatError: (error) => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '')
    return { ...error, message };
  },
  context: async () => ({
    models,
    me: await models.User.findByLogin('jeremyphilipson')
  })
});

server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync })
  .then(async () => {
    if (eraseDatabaseOnSync) createUsersWithMessages()
    app.listen({ port: 8000 }, () => console.log('apollo server on http://localhost:8000/graphql'));
  })

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'jeremyphilipson',
      firstName: 'Jeremy',
      lastName: 'Philipson',
      messages: [
        {
          text: 'Learning how to use GraphQL'
        },
        {
          text: 'Just started in Front End Engineering!'
        }
      ]
    },
    {
      include: [ models.Message]
    }
  );

  await models.User.create(
    {
      username: 'carolynjfine',
      firstName: 'Carolyn',
      lastName: 'Fine',
      messages: [
        {
          text: `Likes to watch 'This is Us'`
        },
        {
          text: 'Likes to cuddle'
        }
      ]
    },
    {
      include: [ models.Message ]
    }
  )
}
