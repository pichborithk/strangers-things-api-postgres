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

async function getUser(field) {
  const [key] = Object.keys(field);
  console.log(key, field[key]);
  try {
    const { rows } = await db.query(
      `
      SELECT id, username, password, salt
      FROM users
      WHERE ${key}=$1;
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

module.exports = { createUser, getUser };
