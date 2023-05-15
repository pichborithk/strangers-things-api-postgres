const { db } = require('../config/default');

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
      JOIN users ON posts."authorId"=users._id;
      `
    );

    rows.forEach(post => {
      post.author = { _id: post.authorId, username: post.authorUsername };
      delete post.authorId;
      delete post.authorUsername;
    });

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  const { rows } = await db.query(
    `
    SELECT title, description, price, location, "willDeliver"
    FROM posts
    WHERE "authorId"=$1;
    `,
    [userId]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows;
}

module.exports = { createPost, getAllPosts, getPostsByUser };
