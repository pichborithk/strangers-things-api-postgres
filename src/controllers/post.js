const { createPost } = require('../models/post');
const { getUser } = require('../models/user');

const addPost = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res
        .status(403)
        .json({ success: false, message: 'Please login to make new post' });
      return;
    }

    const user = await getUser({ sessionToken });

    if (!user || !user.id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, description, price, willDeliver, location } = req.body;

    if (!title || !description || !price || typeof willDeliver !== 'boolean') {
      res.status(400).json({ success: false, message: 'Missing information' });
      return;
    }

    const post = await createPost({
      title,
      description,
      price,
      willDeliver,
      location: location ? location : '[On Request]',
      authorId: user.id,
    });

    res
      .status(201)
      .json({ success: true, message: 'Success add new post', data: post });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

module.exports = { addPost };
