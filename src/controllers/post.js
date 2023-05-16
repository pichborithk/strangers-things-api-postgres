const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
} = require('../models/post');
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
      post.author = { _id: post.authorId, username: post.authorUsername };
      delete post.authorId;
      delete post.authorUsername;
    });

    const filteredPosts = posts.filter(post => post.active);

    res.status(200).json({ success: true, data: filteredPosts });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

const patchPost = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res.status(403).json({ success: false, message: 'Please login to edit' });
      return;
    }

    const { postId } = req.params;

    if (!postId) {
      res.status(403).json({ success: false, message: 'Post does not exist' });
      return;
    }

    const post = await getPostById(postId);

    if (!post || !post._id || !post.active) {
      res.status(403).json({ success: false, message: 'Post does not exist' });
      return;
    }

    const { title, description, price, willDeliver, location } = req.body;

    if (!title || !description || !price || typeof willDeliver !== 'boolean') {
      res.status(400).json({ success: false, message: 'Missing information' });
      return;
    }

    const user = await getUser({ sessionToken });

    if (!user._id || user._id !== post.authorId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const updatedPost = await updatePost(postId, {
      title,
      description,
      price,
      willDeliver,
      location: location ? location : '[On Request]',
    });

    res.status(200).json({ success: true, data: updatedPost });
    return;
  } catch {
    res.status(500).json({ success: false, error });
    return;
  }
};

module.exports = { addPost, readAll, patchPost };
