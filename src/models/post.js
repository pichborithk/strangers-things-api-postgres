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
      JOIN users ON posts."authorId"=users._id;
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
    SELECT title, description, price, location, "willDeliver"
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

module.exports = { createPost, getAllPosts, getPostById, getPostsByUser };
