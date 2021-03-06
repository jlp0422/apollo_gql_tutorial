const { ForbiddenError } = require('apollo-server');
const { combineResolvers, skip } = require('graphql-resolvers');

// is resolver, takes same args as normal resolver
const isAuthenticated = (parent, args, { me }) => {
  me ? skip : new ForbiddenError('Not authenticated user.');
}

isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { isAdmin } } ) => (
    isAdmin ? skip : new ForbiddenError('Not authorized as admin.')
  ));

// is resolver, takes same args as normal resolver
const isMessageOwner = async (
  parent,
  { id },
  { models, me }
) => {
  const message = await models.Message.findById(id, { raw: true });
  if (message.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as message owner.');
  }
  return skip;
}

module.exports = {
  isAuthenticated,
  isMessageOwner,
  isAdmin
};
