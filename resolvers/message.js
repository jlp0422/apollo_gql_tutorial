const uuidv4 = require('uuid/v4');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated, isMessageOwner } = require('./authorization');
const Sequelize = require('sequelize');

// combineResolvers will run resolvers IN ORDER //

const toCursorHash = (string) => Buffer.from(string).toString('base64');
const fromCursorHash = (string) => Buffer.from(string, 'base64').toString('ascii');

module.exports = {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      console.log(fromCursorHash(cursor))
      const messages = await models.Message.findAll({
        order: [[ 'createdAt', 'DESC' ]],
        limit: limit + 1,
        cursor: cursor ? {
          createdAt: { [Sequelize.Op.lt]: fromCursorHash(cursor) }
        } : null
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(
            messages[messages.length -1].createdAt.toString()
          )
        }
      }
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
