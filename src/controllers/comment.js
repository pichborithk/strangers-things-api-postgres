const {
  createComment,
  getCommentById,
  deleteComment,
} = require('../models/comment');
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

const removeComment = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization;
    if (!sessionToken) {
      res.status(403).json({ success: false, message: 'Please login...' });
      return;
    }

    const { postId } = req.params;

    if (!postId) {
      res.status(403).json({ success: false, message: 'Post does not exist' });
      return;
    }

    const { commentId } = req.body;

    if (!commentId) {
      res.sendStatus(400);
      return;
    }
    const comment = await getCommentById(commentId);

    if (!comment || !comment._id) {
      res
        .status(404)
        .json({ success: false, message: 'Comment does not exist' });
      return;
    }

    const user = await getUser({ sessionToken });

    if (!user._id || comment.authorId !== user._id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const post = await getPostById(postId);

    if (!post || comment.postId !== postId) {
      res
        .status(404)
        .json({ success: false, message: 'Comment does not exist' });
      return;
    }

    const deletedComment = await deleteComment(commentId);

    res.status(201).json({
      success: true,
      message: 'Success delete new comment',
      data: deletedComment,
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, error });
    return;
  }
};

module.exports = { addComment, removeComment };
