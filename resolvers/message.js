const uuidv4 = require('uuid/v4');

module.exports = {
  Query: {
    messages: async (parent, args, { models }) => await models.Message.findAll(),
    message: async (parent, { id }, { models }) => await models.Message.findById(id),
  },

  Mutation: {
    createMessage: async (parent, { text }, { me, models }) => {
      try {
        return await models.Message.create({
          text,
          userId: me.id
        })
      } catch (error) {
        throw new Error(error)
      }
    },

    deleteMessage: async (parent, { id }, { models }) => {
      return await models.Message.destroy({ where: { id } })
    },
    // updateMessage: (parent, info, { models }) => {
    //   let { [info.id]: message, ...otherMessages } = models.messages;
    //   if (!message) return false;
    //   const updatedMessage = Object.assign({}, message, info)
    //   models.messages = { [`${updatedMessage.id}`]: updatedMessage, ...otherMessages }
    //   return updatedMessage
    // }
  },

  Message: {
    user: async (message, args, { models }) => await models.User.findById(message.userId)
  }
};
