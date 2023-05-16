const { db } = require('../config/default');

async function createMessage(fields) {
  const { content, authorId, conversationId } = fields;
  try {
    const { rows } = await db.query(
      `
      INSERT INTO messages (content, "authorId", "conversationId")
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [content, authorId, conversationId]
    );

    const [message] = rows;
    return message;
  } catch (error) {
    throw error;
  }
}

async function getMessagesByConversation(conversationId) {
  try {
    const { rows } = await db.query(
      `
      SELECT messages.*, users.username
      FROM messages
      JOIN users ON messages."authorId"=users._id
      WHERE "conversationId" = $1;
      `,
      [conversationId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = { createMessage, getMessagesByConversation };
