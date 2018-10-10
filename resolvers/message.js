const uuidv4 = require('uuid/v4');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated, isMessageOwner } = require('./authorization');
const Sequelize = require('sequelize');

// combineResolvers will run resolvers IN ORDER //

module.exports = {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      return await models.Message.findAll({
        order: [[ 'createdAt', 'DESC' ]],
        limit,
        where: cursor ? {
          createdAt: {
            [Sequelize.Op.lt]: new Date(cursor).getTime(),
          }
        } : null
      })
    },
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
