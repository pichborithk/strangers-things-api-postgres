const { createComment } = require('../models/comment');
const { getPostById } = require('../models/post');
const { getUser } = require('../models/user');

const addComment = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res
        .status(403)
        .json({ success: false, message: 'Please login to make new comment' });
      return;
    }

    const user = await getUser({ sessionToken });

    const { postId } = req.params;

    if (!user._id || !postId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const post = await getPostById(postId);
    if (!post || !post._id || !post.active) {
      res.status(404).json({ success: false, message: 'Post does not exist' });
      return;
    }

    const { content } = req.body;

    if (!content) {
      res.sendStatus(400);
      return;
    }

    const comment = await createComment({
      content,
      postId,
      authorId: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Success add new comment',
      data: comment,
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

module.exports = { addComment };
