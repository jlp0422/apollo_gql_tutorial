const uuidv4 = require('uuid/v4');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated, isMessageOwner } = require('./authorization');

// combineResolvers will run resolvers _in order_ //

module.exports = {
  Query: {
    messages: async (parent, args, { models }) => await models.Message.findAll(),
    message: async (parent, { id }, { models }) => await models.Message.findById(id),
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, models }) => {
        return await models.Message.create({
          text,
          userId: me.id
        })
      }
    ),

    deleteMessage: combineResolvers(
      // these will run in order
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
        return await models.Message.destroy({ where: { id } })
      },
    )
  },

  Message: {
    user: async (message, args, { models }) => await models.User.findById(message.userId)
  }
};
