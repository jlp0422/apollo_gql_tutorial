const uuidv4 = require('uuid/v4');

const createToken = async (user) => {
  //
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
      { username, email, password },
      { models },
    ) => {
      const user = await models.User.create({
        username,
        email,
        password
      });

      return { token: createToken(user) }
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
