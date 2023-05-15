const router = require('express').Router();
const controller = require('../controllers/user');

router.post('/register', controller.register);
// router.post('/login', controller.loginUser);
// router.get('/get', controller.readAll);
// router.get('/me', controller.readUser);

module.exports = router;
