const { db } = require('../config/default');
const { userList, postList } = require('./dummy.data');
const { createComment } = require('../models/comment');
const { createPost } = require('../models/post');
const { createUser } = require('../models/user');

async function dropTables() {
  try {
    console.log('Starting to drop tables...');

    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
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
        _id             UUID            PRIMARY KEY   DEFAULT uuid_generate_v4(),
        username        VARCHAR(255)    NOT NULL      UNIQUE,
        password        VARCHAR(255)    NOT NULL,
        salt            VARCHAR(255)    NOT NULL,
        "sessionToken"  VARCHAR(255),
        "createdAt"     TIMESTAMP(3)    NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"     TIMESTAMP(3)    NOT NULL      DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE posts (
        _id             UUID                          PRIMARY KEY   DEFAULT uuid_generate_v4(),
        title           VARCHAR(255)                  NOT NULL,
        description     VARCHAR(255)                  NOT NULL,
        price           VARCHAR(255)                  NOT NULL,
        location        VARCHAR(255)                  NOT NULL,
        "willDeliver"   Boolean                       NOT NULL,
        "authorId"      UUID REFERENCES users(_id)    NOT NULL,
        "createdAt"     TIMESTAMP(3)                  NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"     TIMESTAMP(3)                  NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        active          Boolean                       NOT NULL      DEFAULT true
      );

      CREATE TABLE comments (
        _id           UUID                          PRIMARY KEY   DEFAULT uuid_generate_v4(),
        content       VARCHAR(255)                  NOT NULL,
        "postId"      UUID REFERENCES posts(_id)    NOT NULL,
        "authorId"    UUID REFERENCES users(_id)    NOT NULL,
        "createdAt"   TIMESTAMP(3)                  NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3)                  NOT NULL      DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE conversations (
        _id           UUID            PRIMARY KEY   DEFAULT uuid_generate_v4(),
        "createdAt"   TIMESTAMP(3)    NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3)    NOT NULL      DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users_conversations (
        "userId"            UUID REFERENCES users(_id)            NOT NULL,           
        "conversationId"    UUID REFERENCES conversations(_id)    NOT NULL,
        UNIQUE ("userId", "conversationId")
      );

      CREATE TABLE messages (
        _id               UUID                                  PRIMARY KEY   DEFAULT uuid_generate_v4(),
        content           VARCHAR(255)                          NOT NULL,
        "authorId"        UUID REFERENCES users(_id)            NOT NULL,
        "conversationId"  UUID REFERENCES conversations(_id)    NOT NULL,
        "createdAt"       TIMESTAMP(3)                          NOT NULL      DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"       TIMESTAMP(3)                          NOT NULL      DEFAULT CURRENT_TIMESTAMP
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

async function testDB() {
  const users = await Promise.all(userList.map(user => createUser(user)));
  const post1 = await createPost({ ...postList[0], authorId: users[0]._id });
  const post2 = await createPost({ ...postList[1], authorId: users[1]._id });
  const post3 = await createPost({ ...postList[2], authorId: users[2]._id });
  const post4 = await createPost({ ...postList[3], authorId: users[0]._id });
  const post5 = await createPost({ ...postList[4], authorId: users[1]._id });
  await createComment({
    content: 'comment #1',
    postId: post1._id,
    authorId: users[1]._id,
  });
  await createComment({
    content: 'comment #2',
    postId: post1._id,
    authorId: users[2]._id,
  });
  await createComment({
    content: 'comment #3',
    postId: post1._id,
    authorId: users[0]._id,
  });
  await createComment({
    content: 'comment #4',
    postId: post1._id,
    authorId: users[1]._id,
  });
  await createComment({
    content: 'comment #5',
    postId: post2._id,
    authorId: users[0]._id,
  });
  await createComment({
    content: 'comment #6',
    postId: post2._id,
    authorId: users[1]._id,
  });
  await createComment({
    content: 'comment #7',
    postId: post2._id,
    authorId: users[0]._id,
  });
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => db.end());
