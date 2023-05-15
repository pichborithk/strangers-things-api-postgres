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

module.exports = { createPost };
