const { db } = require('../config/default');
const { addCommentsToPost } = require('./comment');

async function createPost(fields) {
  const { title, description, price, location, willDeliver, authorId } = fields;
  try {
    const { rows } = await db.query(
      `
      INSERT INTO posts (title, description, price, location, "willDeliver", "authorId")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [title, description, price, location, willDeliver, authorId]
    );

    const [post] = rows;
    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await db.query(
      `
      SELECT posts.*, users.username as "authorUsername"
      FROM posts
      JOIN users ON posts."authorId"=users._id
      WHERE posts.active=true;
      `
    );

    const posts = await Promise.all(rows.map(post => addCommentsToPost(post)));

    return posts;
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM posts
    WHERE _id=$1;
    `,
    [postId]
  );

  const [post] = rows;
  return post;
}

async function getPostsByUser(userId) {
  const { rows } = await db.query(
    `
    SELECT _id, title, description, price, location, "willDeliver", "createdAt", "updatedAt", active
    FROM posts
    WHERE "authorId"=$1;
    `,
    [userId]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const posts = await Promise.all(rows.map(post => addCommentsToPost(post)));

  return posts;
}

async function updatePost(postId, fields) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 2}`)
    .join(', ');

  if (setString.length <= 0) {
    return;
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE _id=$1
        RETURNING *;
      `,
      [postId, ...Object.values(fields)]
    );

    const [post] = rows;
    return post;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  updatePost,
};
