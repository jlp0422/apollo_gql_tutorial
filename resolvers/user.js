const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username } = user;
  return await jwt.sign({ id, email, username }, secret, {
    expiresIn
  })
}

module.exports = {
  Query: {
    users: async (parent, args, { models }) => await models.User.findAll(),
    user: async (parent, { id }, { models }) => await models.User.findById(id),
    me: async (parent, args, { me }) => {
      if (!me) return null;
      await models.User.findById(me.id)
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
    }
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
