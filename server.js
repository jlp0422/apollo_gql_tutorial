require('dotenv').config()
const express = require('express')
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
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
      .replace('Context creation failed: ', '')
    return { ...error, message };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return { models }
    };

    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: SECRET
      };
    }
  }
});

server.applyMiddleware({ app, path: '/graphql' });
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync })
  .then(async () => {
    if (eraseDatabaseOnSync) createUsersWithMessages()
    httpServer.listen({ port: 8000 }, () => console.log('apollo server on http://localhost:8000/graphql'));
  })

const createUsersWithMessages = async () => {
  const date = new Date()
  await models.User.create(
    {
      username: 'jlp0422',
      firstName: 'Jeremy',
      lastName: 'Philipson',
      email: 'jeremyphilipson@gmail.com',
      password: 'password',
      isAdmin: true,
      messages: [
        {
          text: 'Learning GraphQL',
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          text: 'Just started in Engineering!',
          createdAt: date.setSeconds(date.getSeconds() + 2)
        }
      ]
    },
    {
      include: [ models.Message ]
    }
  );

  await models.User.create(
    {
      username: 'cjfine',
      firstName: 'Carolyn',
      lastName: 'Fine',
      email: 'carolynjfine@gmail.com',
      password: 'password',
      isAdmin: false,
      messages: [
        {
          text: `Likes to watch 'This is Us'`,
          createdAt: date.setSeconds(date.getSeconds() + 3)
        },
        {
          text: 'Likes the Yankees',
          createdAt: date.setSeconds(date.getSeconds() + 4)
        }
      ]
    },
    {
      include: [ models.Message ]
    }
  )
}
