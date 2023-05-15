const { db } = require('../config/default');

async function dropTables() {
  try {
    console.log('Starting to drop tables...');

    await db.query(`
      DROP TABLE IF EXISTS users_conversations;
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS conversations;
      DROP TABLE IF EXISTS users;
    `);

    console.log('Finished dropping tables!');
  } catch (error) {
    console.error('Error dropping tables!');
    throw error;
  }
}

async function createTables() {
  try {
    console.log('Starting to build tables...');

    await db.query(`
      CREATE TABLE users (
        id       SERIAL       PRIMARY KEY,
        username VARCHAR(255) NOT NULL     UNIQUE,
        createAt TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        updateAt TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE posts (
        id          SERIAL                       PRIMARY KEY,
        title       VARCHAR(255)                 NOT NULL,
        description VARCHAR(255)                 NOT NULL,
        price       VARCHAR(255)                 NOT NULL,
        willDeliver Boolean                      NOT NULL,
        "authorId"  INTEGER REFERENCES users(id) NOT NULL,
        createAt    TIMESTAMP(3)                 NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        updateAt    TIMESTAMP(3)                 NOT NULL
      );

      CREATE TABLE comments (
        id          SERIAL                       PRIMARY KEY,
        content     VARCHAR(255)                 NOT NULL,
        "postId"    INTEGER REFERENCES posts(id) NOT NULL,
        "authorId"  INTEGER REFERENCES users(id) NOT NULL,
        createAt    TIMESTAMP(3)                 NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        updateAt    TIMESTAMP(3)                 NOT NULL
      );

      CREATE TABLE conversations (
        id       SERIAL       PRIMARY KEY,
        createAt TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        updateAt TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE users_conversations (
        "userId"         INTEGER REFERENCES users(id)           NOT NULL,           
        "conversationId" INTEGER REFERENCES conversations(id) NOT NULL,
        UNIQUE ("userId", "conversationId")
      );

      CREATE TABLE messages (
        id               SERIAL                               PRIMARY KEY,
        content          VARCHAR(255)                         NOT NULL,
        "authorId"       INTEGER REFERENCES users(id)         NOT NULL,
        "conversationId" INTEGER REFERENCES conversations(id) NOT NULL,
        createAt         TIMESTAMP(3)                         NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        updateAt         TIMESTAMP(3)
      );
    `);

    console.log('Finished building tables!');
  } catch (error) {
    console.error('Error building tables!');
    throw error;
  }
}

async function rebuildDB() {
  try {
    await db.connect();

    await dropTables();
    await createTables();
  } catch (error) {
    console.error(error);
  }
}

rebuildDB()
  .catch(console.error)
  .finally(() => db.end());
