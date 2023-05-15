const express = require('express');

const { db, config } = require('./config/default');
const Logging = require('./library/Logging');

const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
// const messageRoutes = require('./routes/message');

const server = express();

db.connect()
  .then(() => {
    Logging.info('Connected to Postgres');
    StartServer();
  })
  .catch(error => {
    Logging.error('Unable to connect: ');
    Logging.error(error);
  });

const StartServer = () => {
  server.use((req, res, next) => {
    Logging.info(
      `Incoming -> Method: [${req.method}] - url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      Logging.info(
        `Incoming -> Method: [${req.method}] - url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });

    next();
  });

  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  // Rules of our API
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method == 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Methods',
        'PUT, POST, PATCH, DELETE, GET'
      );
      return res.status(200).json({});
    }

    next();
  });

  /** Routes */
  server.use('/api/users', userRoutes);
  server.use('/api/posts', postRoutes);
  server.use('/api/comments', commentRoutes);
  // server.use('/api/messages', messageRoutes);

  /** Health Check */
  server.get('/ping', (req, res, next) =>
    res.status(200).json({ message: 'Hello Server' })
  );

  /** Error handling */
  server.use((req, res, next) => {
    const error = new Error('Not found');

    Logging.error(error);

    return res.status(404).json({
      message: error.message,
    });
  });

  server.listen(config.server.port, () =>
    Logging.info(`Server is running on port ${config.server.port}`)
  );
};
