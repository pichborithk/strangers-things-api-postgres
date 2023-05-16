const { authentication, random } = require('../helpers/authentication');
const { getConversationsByUser } = require('../models/conversation');
const { getPostsByUser } = require('../models/post');
const { getUser, createUser, updateUser } = require('../models/user');

async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!password || !username) {
      res.status(400).json({ success: false, message: 'Missing information' });
      return;
    }

    const isUserExist = await getUser({ username });
    // console.log(isUserExist);
    if (isUserExist) {
      res.status(409).json({ success: false, message: 'User Already Exist' });
      return;
    }

    const salt = random();
    const user = await createUser({
      username,
      password: authentication(salt, password),
      salt,
    });

    res.status(201).json({
      success: true,
      message: 'Thanks for signing up for our service',
      data: { username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!password || !username) {
      res.sendStatus(400);
      return;
    }
    const user = await getUser({ username });

    if (!user._id) {
      res.status(409).json({ success: false, message: 'User Do Not Exist' });
      return;
    }

    const expectedHash = authentication(user.salt, password);
    if (user.password !== expectedHash) {
      res.send(403).json({ success: false, message: 'Wrong Password' });
      return;
    }

    const salt = random();
    user.sessionToken = authentication(salt, user._id);

    await updateUser(user._id, { sessionToken: user.sessionToken });

    res.status(200).json({
      success: true,
      message: 'Thanks for logging in to our service',
      data: { username, token: user.sessionToken },
    });
    return;
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

const readUser = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res.status(403).json({ success: false, message: 'Please login...' });
      return;
    }

    const user = await getUser({ sessionToken });
    delete user.password;
    delete user.salt;
    user.posts = await getPostsByUser(user._id);

    const conversations = await getConversationsByUser(user._id);
    // console.log(conversations);
    user.conversations = conversations.map(conversation => {
      let withUser = {};
      let _id = conversation[0].conversationId;
      for (let message of conversation) {
        if (message.username !== user.username) {
          withUser = { username: message.username, _id: message.authorId };
        }
        message.fromUser = {
          username: message.username,
          _id: message.authorId,
        };
      }
      return { messages: conversation, withUser, _id };
    });

    res.status(200).json({ success: true, data: user });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

module.exports = { register, login, readUser };
