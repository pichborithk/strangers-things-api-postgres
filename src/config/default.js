require('dotenv').config();
const { Client } = require('pg');

const db = new Client(process.env.DATABASE_URL);
// const client = new Client({
//   user: 'postgres',
//   password: 'postgres',
//   database: 'juicebox-dev',
// });

const SERVER_PORT = Number(process.env.SERVER_PORT) || 1337;

module.exports = {
  db,
  config: {
    server: {
      port: SERVER_PORT,
    },
  },
};
