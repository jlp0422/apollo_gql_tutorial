const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'A message is required to have text.'
        }
      }
    }
  });

  Message.associate = models => {
    Message.belongsTo(models.User);
  };

  return Message;
};

module.exports = message;
