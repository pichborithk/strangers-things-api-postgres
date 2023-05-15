const { createPost, getAllPosts } = require('../models/post');
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

    if (!user || !user._id) {
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
      authorId: user._id,
    });
    delete post.authorId;

    res
      .status(201)
      .json({ success: true, message: 'Success add new post', data: post });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

const readAll = async (req, res) => {
  try {
    const posts = await getAllPosts();
    const sessionToken = req.headers.authorization;

    const user = await getUser({ sessionToken });

    posts.forEach(post => {
      if (user && post.authorId === user._id) {
        post.isAuthor = true;
      } else {
        post.isAuthor = false;
      }
    });

    res.status(200).json({ success: true, data: posts });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

module.exports = { addPost, readAll };
