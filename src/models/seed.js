const { db } = require('../config/default');
const { authentication } = require('../helpers/authentication');
const { createComment } = require('./comment');
const { createPost } = require('./post');
const { createUser, getUser } = require('./user');

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
        _id            SERIAL       PRIMARY KEY,
        username       VARCHAR(255) NOT NULL     UNIQUE,
        password       VARCHAR(255) NOT NULL,
        salt           VARCHAR(255) NOT NULL,
        "sessionToken" VARCHAR(255),
        "createAt"     TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        "updateAt"     TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE posts (
        _id           SERIAL                        PRIMARY KEY,
        title         VARCHAR(255)                  NOT NULL,
        description   VARCHAR(255)                  NOT NULL,
        price         VARCHAR(255)                  NOT NULL,
        location      VARCHAR(255)                  NOT NULL,
        "willDeliver" Boolean                       NOT NULL,
        "authorId"    INTEGER REFERENCES users(_id) NOT NULL,
        "createAt"    TIMESTAMP(3)                  NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        "updateAt"    TIMESTAMP(3)                  NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        active        Boolean                       NOT NULL     DEFAULT true,
      );

      CREATE TABLE comments (
        _id         SERIAL                        PRIMARY KEY,
        content     VARCHAR(255)                  NOT NULL,
        "postId"    INTEGER REFERENCES posts(_id) NOT NULL,
        "authorId"  INTEGER REFERENCES users(_id) NOT NULL,
        "createAt"  TIMESTAMP(3)                  NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        "updateAt"  TIMESTAMP(3)                  NOT NULL     DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE conversations (
        _id        SERIAL       PRIMARY KEY,
        "createAt" TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        "updateAt" TIMESTAMP(3) NOT NULL     DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users_conversations (
        "userId"         INTEGER REFERENCES users(_id)         NOT NULL,           
        "conversationId" INTEGER REFERENCES conversations(_id) NOT NULL,
        UNIQUE ("userId", "conversationId")
      );

      CREATE TABLE messages (
        _id              SERIAL                                PRIMARY KEY,
        content          VARCHAR(255)                          NOT NULL,
        "authorId"       INTEGER REFERENCES users(_id)         NOT NULL,
        "conversationId" INTEGER REFERENCES conversations(_id) NOT NULL,
        "createAt"       TIMESTAMP(3)                          NOT NULL     DEFAULT CURRENT_TIMESTAMP,
        "updateAt"       TIMESTAMP(3)                          NOT NULL     DEFAULT CURRENT_TIMESTAMP
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
  await createUser({
    username: 'john',
    password: authentication('123', '123'),
    salt: '123',
  });
  await createUser({
    username: 'david',
    password: authentication('123', '123'),
    salt: '123',
  });
  await createUser({
    username: 'kevin',
    password: authentication('123', '123'),
    salt: '123',
  });
  await createPost({
    title: 'post #1',
    description: 'description #1',
    price: 'price #1',
    location: 'location #1',
    willDeliver: false,
    authorId: 1,
  });
  await createPost({
    title: 'post #2',
    description: 'description #2',
    price: 'price #2',
    location: 'location #2',
    willDeliver: false,
    authorId: 2,
  });
  await createPost({
    title: 'post #3',
    description: 'description #3',
    price: 'price #3',
    location: 'location #3',
    willDeliver: false,
    authorId: 3,
  });
  await createPost({
    title: 'post #4',
    description: 'description #4',
    price: 'price #4',
    location: 'location #4',
    willDeliver: true,
    authorId: 1,
  });
  await createPost({
    title: 'post #5',
    description: 'description #5',
    price: 'price #5',
    location: 'location #5',
    willDeliver: true,
    authorId: 2,
  });
  await createComment({ content: 'comment #1', postId: 1, authorId: 2 });
  await createComment({ content: 'comment #2', postId: 1, authorId: 3 });
  await createComment({ content: 'comment #3', postId: 1, authorId: 1 });
  await createComment({ content: 'comment #4', postId: 1, authorId: 2 });
  await createComment({ content: 'comment #5', postId: 2, authorId: 1 });
  await createComment({ content: 'comment #6', postId: 2, authorId: 2 });
  await createComment({ content: 'comment #7', postId: 2, authorId: 1 });
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => db.end());
