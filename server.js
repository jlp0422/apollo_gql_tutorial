require('dotenv').config()
const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {
  ApolloServer,
  AuthenticationError
} = require('apollo-server-express');
const { models, sequelize } = require('./models');
const schema = require('./schema');
const resolvers = require('./resolvers');
const { SECRET } = process.env

const app = express();
app.use(cors());

const getMe = async (req) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      return await jwt.verify(token, SECRET)
    }
    catch (error) {
      throw new AuthenticationError('Your session has expired. Please sign in again.')
    };
  };
};

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
  context: async ({ req }) => {
    const me = await getMe(req);
    return {
      models,
      me,
      secret: SECRET
    };
  }
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
      username: 'jlp0422',
      firstName: 'Jeremy',
      lastName: 'Philipson',
      email: 'jeremyphilipson@gmail.com',
      password: 'charlesbear',
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
      username: 'cjfine',
      firstName: 'Carolyn',
      lastName: 'Fine',
      email: 'carolynjfine@gmail.com',
      password: 'lucybear',
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
