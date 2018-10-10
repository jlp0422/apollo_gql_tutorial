const { PubSub } = require('apollo-server');

const MESSAGE_EVENTS = require('./message');

const pubsub = new PubSub()

module.exports = {
  pubsub,
  EVENTS: {
    MESSAGE: MESSAGE_EVENTS
  }
}
