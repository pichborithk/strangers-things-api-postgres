const { authentication } = require('../helpers/authentication');

const userList = [
  {
    username: 'john',
    password: authentication('123', '123'),
    salt: '123',
  },
  {
    username: 'david',
    password: authentication('123', '123'),
    salt: '123',
  },
  {
    username: 'kevin',
    password: authentication('123', '123'),
    salt: '123',
  },
];

const postList = [
  {
    title: 'post #1',
    description: 'description #1',
    price: 'price #1',
    location: 'location #1',
    willDeliver: false,
  },
  {
    title: 'post #2',
    description: 'description #2',
    price: 'price #2',
    location: 'location #2',
    willDeliver: false,
  },
  {
    title: 'post #3',
    description: 'description #3',
    price: 'price #3',
    location: 'location #3',
    willDeliver: false,
  },
  {
    title: 'post #4',
    description: 'description #4',
    price: 'price #4',
    location: 'location #4',
    willDeliver: true,
  },
  {
    title: 'post #5',
    description: 'description #5',
    price: 'price #5',
    location: 'location #5',
    willDeliver: true,
  },
];

const commentList = [
  { content: 'comment #1' },
  { content: 'comment #2' },
  { content: 'comment #3' },
  { content: 'comment #4' },
  { content: 'comment #5' },
  { content: 'comment #6' },
  { content: 'comment #7' },
];

module.exports = { userList, postList, commentList };
