const { db } = require('../config/default');

async function createComment(fields) {
  const { content, postId, authorId } = fields;
  try {
    const { rows } = await db.query(
      `
      INSERT INTO comments (content, "postId", "authorId")
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [content, postId, authorId]
    );

    const [comment] = rows;
    return comment;
  } catch (error) {
    throw error;
  }
}

async function getCommentById(commentId) {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM comments
      WHERE _id=$1
      `,
      [commentId]
    );

    const [comment] = rows;
    return comment;
  } catch (error) {
    throw error;
  }
}

async function addCommentsToPost(post) {
  try {
    const { rows } = await db.query(
      `
      SELECT comments.*, users.username as "fromUserUsername"
      FROM comments
      JOIN users ON comments."authorId"=users._id
      WHERE "postId"=$1
      `,
      [post._id]
    );

    rows.forEach(comment => {
      comment.fromUser = {
        _id: comment.authorId,
        username: comment.fromUserUsername,
      };
      delete comment.authorId;
      delete comment.fromUserUsername;
      delete comment.postId;
    });

    post.comments = rows;

    return post;
  } catch (error) {
    throw error;
  }
}

async function deleteComment(commentId) {
  try {
    const { rows } = await db.query(
      `
      DELETE FROM comments
      WHERE _id=$1
      RETURNING *;
      `,
      [commentId]
    );

    const [comment] = rows;
    return comment;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createComment,
  getCommentById,
  addCommentsToPost,
  deleteComment,
};
