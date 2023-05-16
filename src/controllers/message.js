const {
  getConversation,
  createConversation,
} = require('../models/conversation');
const { createMessage } = require('../models/message');
const { getUser } = require('../models/user');

const addMessage = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res
        .status(403)
        .json({ success: false, message: 'Please login to send message' });
      return;
    }

    const sender = await getUser({ sessionToken });

    if (!sender || !sender._id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { content, receiverName } = req.body;
    if (!content) {
      res.sendStatus(400);
      return;
    }

    const receiver = await getUser({ username: receiverName });
    if (!receiver || !receiver._id) {
      res.status(404).json({ success: false, message: 'User does not exist' });
      return;
    }
    const conversationId =
      (await getConversation(sender._id, receiver._id)) ||
      (await createConversation(sender._id, receiver._id));
    console.log(conversationId);

    const message = await createMessage({
      content,
      authorId: sender._id,
      conversationId,
    });

    res.status(201).json({
      success: true,
      message: 'Success send message',
      data: message,
    });
    return;
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

module.exports = { addMessage };
