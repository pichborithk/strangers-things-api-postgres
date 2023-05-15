const { authentication, random } = require('../helpers/authentication');
const { getUser, createUser } = require('../models/user');

async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!password || !username) {
      res.status(400).json({ success: false, message: 'Missing information' });
      return;
    }

    const isUserExist = await getUser({ username });
    console.log(isUserExist);
    if (isUserExist) {
      res.status(409).json({ success: false, message: 'User Already Exist' });
      return;
    }
    const salt = random();
    const user = await createUser({
      username,
      password: authentication(salt, password),
      salt,
    });

    res.status(201).json({
      success: true,
      message: 'Thanks for signing up for our service',
      data: { username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
}

module.exports = { register };
