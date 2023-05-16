const { db } = require('../config/default');
const { getMessagesByConversation } = require('./message');

async function createConversation(senderId, receiverId) {
  try {
    const { rows } = await db.query(
      `
      INSERT INTO conversations (_id)
      VALUES (DEFAULT)
      RETURNING *;
      `
    );

    const [conversation] = rows;

    await db.query(
      `
      INSERT INTO users_conversations ("userId", "conversationId")
      VALUES ($1, $3), ($2, $3);
      `,
      [senderId, receiverId, conversation._id]
    );

    return conversation._id;
  } catch (error) {
    throw error;
  }
}

async function getConversation(senderId, receiverId) {
  try {
    const { rows } = await db.query(
      `
        SELECT "conversationId"
        FROM (SELECT *
              FROM users_conversations
              WHERE "userId" = $1
              OR "userId" = $2) as temptable
        GROUP BY "conversationId" 
        HAVING COUNT(*) > 1;
        `,
      [senderId, receiverId]
    );

    if (rows.length <= 0) {
      return null;
    }

    const [conversation] = rows;
    return conversation.conversationId;
  } catch (error) {
    throw error;
  }
}

async function getConversationsByUser(userId) {
  try {
    const { rows } = await db.query(
      `
      SELECT users_conversations.*, users.username
      FROM users_conversations
      JOIN users ON users._id = users_conversations."userId"
      WHERE "userId" = $1;
      `,
      [userId]
    );

    const conversations = await Promise.all(
      rows.map(conversation =>
        getMessagesByConversation(conversation.conversationId)
      )
    );

    return conversations;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createConversation,
  getConversation,
  getConversationsByUser,
};
