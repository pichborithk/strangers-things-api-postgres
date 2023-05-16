const { db } = require('../config/default');

async function createUser({ username, password, salt }) {
  try {
    const { rows } = await db.query(
      `
      INSERT INTO users (username, password, salt)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
      `,
      [username, password, salt]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
    const { rows } = await db.query(
      `
      SELECT _id, username
      FROM users
      `
    );

    const posts = await Promise.all(rows.map(post => addCommentsToPost(post)));

    return posts;
  } catch (error) {
    throw error;
  }
}

async function getUser(field) {
  const [key] = Object.keys(field);
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM users
      WHERE "${key}"=$1;
      `,
      [field[key]]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 2}`)
    .join(', ');

  if (setString.length <= 0) {
    return;
  }

  try {
    const { rows } = await db.query(
      `
      UPDATE users
      SET ${setString}
      WHERE _id=$1
      RETURNING *;
      `,
      [id, ...Object.values(fields)]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = { createUser, getAllUsers, getUser, updateUser };
