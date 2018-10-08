const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const { combineResolvers } = require('graphql-resolvers');
const { AuthenticationError, UserInputError } = require('apollo-server');
const { isAdmin } = require('./authorization');

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, isAdmin } = user;
  return await jwt.sign({ id, email, username, isAdmin }, secret, {
    expiresIn
  })
}

module.exports = {
  Query: {
    users: async (parent, args, { models }) => await models.User.findAll(),
    user: async (parent, { id }, { models }) => await models.User.findById(id),
    me: async (parent, args, { me, models }) => {
      if (!me) return null;
      return await models.User.findById(me.id)
    }
  },

  Mutation: {
    signUp: async (
      parent,
      { username, email, password }, // items sent via gql query
      { models, secret }, // defined in context in server
    ) => {
      const user = await models.User.create({
        username,
        email,
        password
      });

      return { token: createToken(user, secret, '30m') }
    },

    signIn: async (
      parent,
      { login, password }, // items sent via gql query
      { models, secret } // defined in context in server
    ) => {
      const user = await models.User.findByLogin(login)
      if (!user) {
        throw new UserInputError('No user was found with this login information.')
      };
      const isValidPassword = await user.validatePassword(password)
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret, '30m') }
    },

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        return await models.User.destroy({ where: { id } })
      }
    )
  },

  User: {
    messages: async (user, args, { models }) => {
      return await models.Message.findAll({
        where: {
          userId: user.id
        }
      })
    }
  },
};
